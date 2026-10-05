import { db } from "@/lib/db";
import { logEvent, notifyUser } from "@/lib/orders/service";

/** Single writer for "money arrived": payment → order → stock → delivery → notify. */
export async function applyPaid(orderId: string, providerRef: string, method: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { shop: true } });
  if (!order) throw new Error("not-found");
  if (order.payStatus === "PAID") return order; // idempotent
  if (order.status !== "PENDING_PAYMENT") throw new Error("bad-state");

  await db.payment.updateMany({
    where: { id: order.paymentId ?? undefined },
    data: { status: "PAID", providerRef, method },
  });
  await db.order.update({ where: { id: orderId }, data: { status: "PLACED", payStatus: "PAID" } });
  await logEvent(orderId, "PLACED", `Paid via ${method} (${providerRef})`);

  // Decrement stock (best-effort per item).
  const items = JSON.parse(order.items) as Array<{ productId: string; qty: number }>;
  for (const it of items) {
    await db.product.updateMany({
      where: { id: it.productId, stock: { gte: it.qty } },
      data: { stock: { decrement: it.qty } },
    });
  }
  // Delivery row for pooling/tracking.
  await db.delivery.upsert({
    where: { orderId },
    update: {},
    create: {
      orderId,
      provider: "village-pool",
      trackingId: `OJ${orderId.slice(-6).toUpperCase()}`,
      status: "CREATED",
      events: JSON.stringify([{ at: Date.now(), status: "CREATED" }]),
    },
  });
  // Spoken + inbox alert for the seller.
  await notifyUser(order.shop.ownerId, "new-order", {
    orderId,
    total: order.total,
    items: items.length,
    buyer: order.buyerName,
  });
  return db.order.findUnique({ where: { id: orderId } });
}

export async function applyFailed(orderId: string, reason: string) {  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.payStatus === "PAID") return;
  await db.payment.updateMany({ where: { id: order.paymentId ?? undefined }, data: { status: "FAILED", failureReason: reason } });
  await db.order.update({ where: { id: orderId }, data: { payStatus: "FAILED" } });
  await logEvent(orderId, "PENDING_PAYMENT", `Payment failed: ${reason}`);
}

/** Cash on delivery: stock + delivery + seller alert now, money later. */
export async function applyCod(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { shop: true } });
  if (!order) throw new Error("not-found");
  await db.order.update({ where: { id: orderId }, data: { status: "PLACED", payStatus: "COD_PENDING" } });
  await logEvent(orderId, "PLACED", "Cash on delivery chosen");
  const items = JSON.parse(order.items) as Array<{ productId: string; qty: number }>;
  for (const it of items) {
    await db.product.updateMany({
      where: { id: it.productId, stock: { gte: it.qty } },
      data: { stock: { decrement: it.qty } },
    });
  }
  await db.delivery.upsert({
    where: { orderId },
    update: {},
    create: {
      orderId,
      provider: "village-pool",
      trackingId: `OJ${orderId.slice(-6).toUpperCase()}`,
      status: "CREATED",
      events: JSON.stringify([{ at: Date.now(), status: "CREATED" }]),
    },
  });
  await notifyUser(order.shop.ownerId, "new-order", {
    orderId,
    total: order.total,
    items: items.length,
    buyer: order.buyerName,
    cod: true,
  });
}
