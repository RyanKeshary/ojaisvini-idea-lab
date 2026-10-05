import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyWebhook } from "@/lib/payments/hmac";
import { applyPaid } from "@/lib/orders/paid";

const bodySchema = z.object({
  paymentId: z.string().min(1).max(64),
  force: z.enum(["paid"]).default("paid"),
  signature: z.string().min(8).max(128),
});

/**
 * Signed internal webhook (simulated bank push). Proves the callback came
 * from us via HMAC. Used by admin/demo tooling; buyers never call this.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { paymentId, signature } = parsed.data;
  if (!verifyWebhook(paymentId, signature)) {
    return NextResponse.json({ code: "bad-signature" }, { status: 403 });
  }
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return NextResponse.json({ code: "not-found" }, { status: 404 });
  const order = await db.order.findFirst({ where: { paymentId } });
  if (!order) return NextResponse.json({ code: "not-found" }, { status: 404 });
  await applyPaid(order.id, `demo_hook_${paymentId.slice(-6)}`, payment.method);
  return NextResponse.json({ ok: true, orderId: order.id });
}
