import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPaymentProvider, type AttemptInput } from "@/lib/payments/demo";
import { luhnValid, validUpiId } from "@/lib/payments/luhn";
import { applyPaid, applyFailed } from "@/lib/orders/paid";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const detailsSchema = z.object({
  upiId: z.string().max(60).optional(),
  cardNumber: z.string().max(24).optional(),
  expiry: z.string().max(7).optional(),
  cvv: z.string().max(4).optional(),
  name: z.string().max(60).optional(),
  bank: z.string().max(60).optional(),
});

const bodySchema = z.object({
  orderId: z.string().min(1).max(64),
  method: z.enum(["UPI", "CARD", "NETBANKING", "COD"]),
  details: detailsSchema.default({}),
  idemKey: z.string().max(80).optional(),
});

/** Buyer payment attempt (public, rate-limited, idempotent). */
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
  const { orderId, method, details, idemKey } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ code: "not-found" }, { status: 404 });
  if (order.payStatus === "PAID") return NextResponse.json({ ok: true, next: "done", paymentId: order.paymentId });
  if (order.status !== "PENDING_PAYMENT" || !["UNPAID", "FAILED"].includes(order.payStatus)) {
    return NextResponse.json({ code: "bad-state" }, { status: 409 });
  }
  let payment = await db.payment.findUnique({ where: { id: order.paymentId ?? "" } });
  if (!payment) return NextResponse.json({ code: "not-found" }, { status: 404 });

  // Idempotency: same key replay returns current state, never double-charges.
  if (idemKey && payment.idemKey && payment.idemKey !== `idem_${order.id}`) {
    const existing = await db.payment.findUnique({ where: { idemKey } });
    if (existing) {
      return NextResponse.json({ ok: true, next: existing.status === "PAID" ? "done" : "poll", paymentId: existing.id });
    }
  }
  if (idemKey) {
    await db.payment.update({ where: { id: payment.id }, data: { idemKey } }).catch(() => {});
  }

  // Validate method details before touching the gateway.
  let input: AttemptInput;
  if (method === "UPI") {
    if (!details.upiId || !validUpiId(details.upiId)) {
      return NextResponse.json({ code: "invalid-upi" }, { status: 400 });
    }
    input = { method: "UPI", upiId: details.upiId.trim() };
  } else if (method === "CARD") {
    const num = (details.cardNumber || "").replace(/\D/g, "");
    if (!luhnValid(num) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry || "") || !/^\d{3,4}$/.test(details.cvv || "")) {
      return NextResponse.json({ code: "invalid-card" }, { status: 400 });
    }
    input = { method: "CARD", cardNumber: num, expiry: details.expiry!, cvv: details.cvv!, name: details.name || "" };
  } else if (method === "NETBANKING") {
    if (!details.bank) return NextResponse.json({ code: "invalid-bank" }, { status: 400 });
    input = { method: "NETBANKING", bank: details.bank };
  } else {
    input = { method: "COD" };
  }

  await db.payment.update({ where: { id: payment.id }, data: { method, attempts: { increment: 1 } } });
  const gateway = getPaymentProvider();

  if (method === "COD") {
    await db.payment.update({ where: { id: payment.id }, data: { method: "COD" } });
    const { applyCod } = await import("@/lib/orders/paid");
    await applyCod(order.id);
    return NextResponse.json({ ok: true, next: "cod", paymentId: payment.id });
  }

  if (method === "UPI") {
    // Simulated "approve in your UPI app": client polls; server flips when due.
    const approveAt = Date.now() + 4000;
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "ATTEMPTED", meta: JSON.stringify({ approveAt, upiId: (input as { upiId: string }).upiId }) },
    });
    return NextResponse.json({ ok: true, next: "poll", paymentId: payment.id, approveInMs: 4000 });
  }

  const res = await gateway.attempt(order.total * 100, input);
  if (res.outcome === "failed") {
    await applyFailed(order.id, res.reason);
    return NextResponse.json({ ok: true, next: "failed", paymentId: payment.id, reason: res.reason });
  }
  if (res.outcome === "pending-otp") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "ATTEMPTED", meta: JSON.stringify({ providerRef: res.providerRef }) },
    });
    return NextResponse.json({ ok: true, next: "otp", paymentId: payment.id });
  }
  await applyPaid(order.id, res.providerRef, method);
  return NextResponse.json({ ok: true, next: "done", paymentId: payment.id });
}
