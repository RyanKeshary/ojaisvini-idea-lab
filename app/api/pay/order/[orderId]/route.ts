import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Buyer-safe order summary for the pay/success screens (no PII, no auth).
 * Full details stay behind the phone-verified tracking endpoint.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { name: true, slug: true } } },
  });
  if (!order) return NextResponse.json({ code: "not-found" }, { status: 404 });
  const items = JSON.parse(order.items) as Array<{ title: string; price: number; qty: number }>;
  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      shopName: order.shop.name,
      shopSlug: order.shop.slug,
      status: order.status,
      payStatus: order.payStatus,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      items: items.map((i) => ({ title: i.title, price: i.price, qty: i.qty })),
    },
  });
}
