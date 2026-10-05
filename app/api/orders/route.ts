import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { checkoutSchema, createOrder } from "@/lib/orders/service";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

/** Buyer creates an order (public, rate-limited). */
export async function POST(req: Request) {
  const rl = rateLimit(`order:ip:${clientIp(req.headers)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  try {
    const { order, payment } = await createOrder(parsed.data);
    return NextResponse.json({ ok: true, orderId: order.id, paymentId: payment.id, total: order.total });
  } catch (e) {
    const code = e instanceof Error ? e.message : "invalid-input";
    const status = code === "out-of-stock" || code === "product-unavailable" ? 409 : 400;
    return NextResponse.json({ code }, { status });
  }
}

/** Seller lists orders across her shops (or all orders for Admin). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  let shops = await db.shop.findMany({ where: { ownerId: session.user.id }, select: { id: true } });
  
  if (shops.length === 0 && role !== "ADMIN") {
    const { getOrCreateShop } = await import("@/lib/shop");
    const s = await getOrCreateShop(session.user.id);
    shops = [{ id: s.id }];
  }

  const status = new URL(req.url).searchParams.get("status");
  const whereClause: { shopId?: { in: string[] }; status?: string } = {};

  if (shops.length > 0) {
    whereClause.shopId = { in: shops.map((s) => s.id) };
  }
  if (status) {
    whereClause.status = status;
  }

  const orders = await db.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { events: { orderBy: { createdAt: "asc" } }, shop: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({ ok: true, orders });
}
