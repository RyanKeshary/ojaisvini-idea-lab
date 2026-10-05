import { z } from "zod";
import { db } from "@/lib/db";

export const ORDER_FLOW = [
  "PENDING_PAYMENT",
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

const SELLER_ADVANCE: Record<string, string[]> = {
  PLACED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

/** Pure: which statuses can the seller move to from here? */
export function allowedTransitions(status: string): string[] {
  return SELLER_ADVANCE[status] || [];
}

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  shopSlug: z.string().min(1).max(80),
  items: z.array(cartItemSchema).min(1).max(20),
  buyerName: z.string().trim().min(2).max(60),
  buyerPhone: z.string().regex(/^\d{10}$/),
  addressLine: z.string().trim().max(200).default("Village Centre"),
  pincode: z.string().regex(/^\d{6}$/).default("411001"),
  fulfillment: z.enum(["pickup", "delivery"]).default("delivery"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function addressOf(input: CheckoutInput): string {
  const line = input.addressLine || (input.fulfillment === "pickup" ? "Store Pickup" : "Village Delivery");
  const pin = input.pincode || "411001";
  return JSON.stringify({ line, pincode: pin, fulfillment: input.fulfillment });
}

/** Create PENDING_PAYMENT order + CREATED payment + PENDING payouts (0 net until paid). */
export async function createOrder(input: CheckoutInput) {
  const shop = await db.shop.findUnique({ where: { slug: input.shopSlug } });
  if (!shop || !shop.isLive) throw new Error("shop-closed");
  const products = await db.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, shopId: shop.id, status: "LIVE" },
  });
  if (products.length !== input.items.length) throw new Error("product-unavailable");
  let subtotal = 0;
  const rows = input.items.map((i) => {
    const p = products.find((x) => x.id === i.productId)!;
    if (p.stock <= 0) throw new Error("out-of-stock");
    // If requested quantity exceeds stock in demo/catalog, clamp to available stock gracefully
    const effectiveQty = p.stock < i.qty ? Math.max(1, p.stock) : i.qty;
    subtotal += p.priceINR * effectiveQty;
    const images = JSON.parse(p.images) as string[];
    return { productId: p.id, title: p.title, price: p.priceINR, qty: effectiveQty, image: images[0] || "" };
  });
  const deliveryFee = input.fulfillment === "delivery" ? 30 : 0;
  const total = subtotal + deliveryFee;

  const order = await db.order.create({
    data: {
      shopId: shop.id,
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      address: addressOf(input),
      items: JSON.stringify(rows),
      subtotal,
      deliveryFee,
      total,
      status: "PENDING_PAYMENT",
      payStatus: "UNPAID",
      orderItems: { create: rows },
      events: { create: [{ status: "PENDING_PAYMENT", note: "Order started" }] },
    },
  });
  const payment = await db.payment.create({
    data: { orderId: order.id, method: "UPI", status: "CREATED", idemKey: `idem_${order.id}` },
  });
  await db.order.update({ where: { id: order.id }, data: { paymentId: payment.id } });
  return { order, payment };
}

/** Append a timeline event (single writer helper for all transitions). */
export async function logEvent(orderId: string, status: string, note = "") {
  await db.orderEvent.create({ data: { orderId, status, note } });
}

/** Seller advances status along the allowed edges; creates payout rows on delivery. */
export async function advanceOrder(orderId: string, shopOwnerId: string, to: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { shop: true } });
  if (!order || order.shop.ownerId !== shopOwnerId) throw new Error("forbidden");
  const allowed = allowedTransitions(order.status);
  if (!allowed.includes(to)) throw new Error("bad-transition");
  await db.order.update({ where: { id: orderId }, data: { status: to } });
  await logEvent(orderId, to);
  if (to === "DELIVERED") {
    // Platform fee 0% for the demo (USP); gateway-style fee 2% shown plainly.
    const fee = Math.round(order.total * 0.02);
    await db.payout.create({
      data: {
        shopId: order.shopId,
        orderId: order.id,
        gross: order.total,
        fees: JSON.stringify({ platform: 0, gateway: fee }),
        net: order.total - fee,
        status: "PENDING",
      },
    });
    await notifyUser(order.shop.ownerId, "payout-ready", { orderId: order.id, net: order.total - fee });
  }
  if (to === "ACCEPTED") {
    await notifyUser(order.shop.ownerId, "order-accepted", { orderId: order.id });
  }
  return true;
}

export async function cancelOrder(orderId: string, shopOwnerId: string | null, byBuyerPhone?: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { shop: true } });
  if (!order) throw new Error("not-found");
  const isSeller = shopOwnerId && order.shop.ownerId === shopOwnerId;
  const isBuyer = byBuyerPhone && order.buyerPhone === byBuyerPhone;
  if (!isSeller && !isBuyer) throw new Error("forbidden");
  if (!["PENDING_PAYMENT", "PLACED"].includes(order.status)) throw new Error("bad-transition");
  await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  await logEvent(orderId, "CANCELLED", isSeller ? "Cancelled by seller" : "Cancelled by buyer");
  return true;
}

export async function notifyUser(userId: string, kind: string, payload: unknown) {
  await db.notification.create({ data: { userId, kind, payload: JSON.stringify(payload ?? {}) } });
}

/**
 * Village pooling simulator: group OPEN-batch + unbatched paid orders in the
 * pincode into one batch. Shared cost saving shown per order (₹38 demo).
 */
export async function poolOrders(pincode: string) {
  const openBatch = await db.deliveryBatch.findFirst({ where: { pincode, status: "OPEN" } });
  const batch =
    openBatch ??
    (await db.deliveryBatch.create({ data: { pincode, status: "OPEN", savedPaise: 3800 } }));
  // Attach paid-but-unbatched deliveries in this pincode (address JSON match).
  const candidates = await db.delivery.findMany({
    where: { batch: null, order: { payStatus: { in: ["PAID", "COD_PENDING"] } } },
    include: { order: true },
  });
  let added = 0;
  for (const d of candidates) {
    try {
      const addr = JSON.parse(d.order.address) as { pincode?: string };
      if (addr.pincode !== pincode) continue;
      await db.delivery.update({ where: { id: d.id }, data: { poolId: batch.id } });
      added++;
    } catch {}
  }
  if (added > 0) {
    await db.deliveryBatch.update({ where: { id: batch.id }, data: { status: "READY" } });
  }
  const count = await db.delivery.count({ where: { poolId: batch.id } });
  return { batchId: batch.id, added, count, savedPerOrder: 38 };
}

export async function markBatchCollected(batchId: string) {
  await db.deliveryBatch.update({ where: { id: batchId }, data: { status: "COLLECTED" } });
  const deliveries = await db.delivery.findMany({ where: { poolId: batchId }, include: { order: true } });
  for (const d of deliveries) {
    if (d.order.status === "READY") {
      await db.order.update({ where: { id: d.orderId }, data: { status: "PICKED_UP" } });
      await logEvent(d.orderId, "PICKED_UP", "Sakhi pooled pickup collected");
    }
  }
  return true;
}
