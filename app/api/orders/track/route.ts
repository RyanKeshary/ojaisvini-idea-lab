import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

/** Public buyer tracking: orderId + buyer phone must match. No login. */
export async function GET(req: Request) {
  const rl = rateLimit(`track:ip:${clientIp(req.headers)}`, 60, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const orderId = q.get("orderId") || "";
  const phone = q.get("phone") || "";
  if (!z.string().min(1).max(64).safeParse(orderId).success || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { events: { orderBy: { createdAt: "asc" } }, delivery: true, shop: { select: { name: true, slug: true } } },
  });
  if (!order || order.buyerPhone !== phone) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  const items = JSON.parse(order.items) as Array<{ title: string; price: number; qty: number; image: string }>;
  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      shopName: order.shop.name,
      status: order.status,
      payStatus: order.payStatus,
      total: order.total,
      items,
      trackingId: order.delivery?.trackingId || null,
      events: order.events.map((e) => ({ status: e.status, note: e.note, at: e.createdAt })),
    },
  });
}
