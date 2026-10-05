import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** Demo control: settle PROCESSING payouts (simulates T+2). Clearly labelled demo. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const shops = await db.shop.findMany({ where: { ownerId: session.user.id }, select: { id: true } });
  const res = await db.payout.updateMany({
    where: { shopId: { in: shops.map((s) => s.id) }, status: "PROCESSING" },
    data: { status: "SETTLED", settledAt: new Date() },
  });
  if (res.count === 0) return NextResponse.json({ code: "nothing-processing" }, { status: 409 });
  return NextResponse.json({ ok: true, count: res.count });
}
