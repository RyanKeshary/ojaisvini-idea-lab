import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function maskUpi(upi: string): string {
  const [user, domain] = upi.split("@");
  if (!domain) return "•••";
  const u = user.length <= 2 ? "••" : `${user.slice(0, 2)}•••`;
  return `${u}@${domain}`;
}

/** Seller payout inbox: pending vs settled totals + rows (UPI masked). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const shops = await db.shop.findMany({ where: { ownerId: session.user.id }, select: { id: true } });
  const payouts = await db.payout.findMany({
    where: { shopId: { in: shops.map((s) => s.id) } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: { select: { id: true, buyerName: true, status: true } } },
  });
  const sum = (xs: typeof payouts) => xs.reduce((a, p) => a + p.net, 0);
  const pending = payouts.filter((p) => p.status !== "SETTLED");
  const settled = payouts.filter((p) => p.status === "SETTLED");
  return NextResponse.json({
    ok: true,
    pendingTotal: sum(pending),
    settledTotal: sum(settled),
    payouts: payouts.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      gross: p.gross,
      fees: JSON.parse(p.fees),
      net: p.net,
      status: p.status,
      upiId: p.upiId ? maskUpi(p.upiId) : "",
      settledAt: p.settledAt,
      createdAt: p.createdAt,
    })),
  });
}

const requestSchema = z.object({ upiId: z.string().regex(/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/) });

/** Withdraw: attach UPI id, move PENDING → PROCESSING (demo). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-upi" }, { status: 400 });
  const shops = await db.shop.findMany({ where: { ownerId: session.user.id }, select: { id: true } });
  const res = await db.payout.updateMany({
    where: { shopId: { in: shops.map((s) => s.id) }, status: "PENDING" },
    data: { status: "PROCESSING", upiId: parsed.data.upiId.trim() },
  });
  if (res.count === 0) return NextResponse.json({ code: "nothing-pending" }, { status: 409 });
  return NextResponse.json({ ok: true, count: res.count });
}
