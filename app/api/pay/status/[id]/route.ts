import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyPaid } from "@/lib/orders/paid";

/**
 * Payment status poll. For UPI the server flips to PAID once the simulated
 * approval time passes — deterministic, no background jobs.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await db.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ code: "not-found" }, { status: 404 });
  if (payment.status === "ATTEMPTED") {
    try {
      const meta = JSON.parse(payment.meta) as { approveAt?: number };
      if (meta.approveAt && meta.approveAt <= Date.now()) {
        const order = await db.order.findFirst({ where: { paymentId: payment.id } });
        if (order && order.payStatus !== "PAID") {
          await applyPaid(order.id, `demo_upi_${payment.id.slice(-6)}`, payment.method);
        }
      }
    } catch {}
  }
  const fresh = await db.payment.findUnique({ where: { id } });
  const order = await db.order.findFirst({ where: { paymentId: id }, select: { id: true, status: true, payStatus: true } });
  return NextResponse.json({
    ok: true,
    status: fresh?.status,
    orderId: order?.id,
    orderStatus: order?.status,
    payStatus: order?.payStatus,
  });
}
