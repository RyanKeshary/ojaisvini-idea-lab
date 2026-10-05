import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Public shop stats for the OG renderer (same data the storefront shows). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.isLive) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  const liveCount = await db.product.count({ where: { shopId: shop.id, status: "LIVE" } });
  return NextResponse.json({ ok: true, name: shop.name, liveCount });
}
