import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments/demo";
import { logEvent } from "@/lib/orders/service";

/** Seller refunds a PAID order (demo: always succeeds, clearly labelled). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ orderId: z.string().min(1).max(64) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { shop: { select: { ownerId: true } } },
  });
  if (!order || order.shop.ownerId !== session.user.id) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  if (order.payStatus !== "PAID" || !["PLACED", "ACCEPTED", "PREPARING"].includes(order.status)) {
    return NextResponse.json({ code: "bad-state" }, { status: 409 });
  }
  const payment = await db.payment.findUnique({ where: { id: order.paymentId ?? "" } });
  if (!payment) return NextResponse.json({ code: "not-found" }, { status: 404 });

  const { ok, refundRef } = await getPaymentProvider().refund(
    payment.providerRef || payment.id,
    order.total * 100
  );
  if (!ok) return NextResponse.json({ code: "refund-failed" }, { status: 502 });
  await db.refund.create({
    data: { paymentId: payment.id, orderId: order.id, amount: order.total, status: "DONE" },
  });
  await db.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
  await db.order.update({ where: { id: order.id }, data: { status: "REFUNDED", payStatus: "REFUNDED" } });
  await logEvent(order.id, "REFUNDED", `Refunded ${refundRef} (demo)`);
  return NextResponse.json({ ok: true, refundRef });
}
