import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { applyPaid, applyFailed } from "@/lib/orders/paid";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const bodySchema = z.object({
  paymentId: z.string().min(1).max(64),
  otp: z.string().regex(/^\d{4,6}$/),
});

/** Demo card OTP step (test OTP 123456). */
export async function POST(req: Request) {
  const rl = rateLimit(`pay:ip:${clientIp(req.headers)}`, 30, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const payment = await db.payment.findUnique({ where: { id: parsed.data.paymentId } });
  if (!payment || payment.status !== "ATTEMPTED") {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  const order = await db.order.findFirst({ where: { paymentId: payment.id } });
  if (!order) return NextResponse.json({ code: "not-found" }, { status: 404 });

  const meta = JSON.parse(payment.meta) as { providerRef?: string };
  if (!meta.providerRef) return NextResponse.json({ code: "bad-state" }, { status: 409 });

  const { getPaymentProvider } = await import("@/lib/payments/demo");
  const res = await getPaymentProvider().verifyCardOtp(meta.providerRef, parsed.data.otp);
  if (res.outcome === "failed") {
    await applyFailed(order.id, res.reason);
    return NextResponse.json({ ok: true, next: "failed", reason: res.reason });
  }
  await applyPaid(order.id, res.providerRef, "CARD");
  return NextResponse.json({ ok: true, next: "done", orderId: order.id });
}
