import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { advanceOrder, cancelOrder } from "@/lib/orders/service";

const advanceSchema = z.object({ to: z.string().min(1).max(32) });

/** Seller order detail (owns the shop). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: "asc" } }, delivery: true, shop: { select: { ownerId: true, slug: true, name: true } } },
  });
  if (!order || order.shop.ownerId !== session.user.id) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order });
}

/** Seller advances status: { to }. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = advanceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  try {
    await advanceOrder(id, session.user.id, parsed.data.to);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof Error ? e.message : "invalid-input";
    const status = code === "forbidden" ? 403 : 400;
    return NextResponse.json({ code }, { status });
  }
}

/** Cancel: seller (authed) or buyer ({ byBuyerPhone }). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {}
  const byBuyerPhone = (body as { byBuyerPhone?: string })?.byBuyerPhone;
  try {
    await cancelOrder(id, session?.user?.id ?? null, byBuyerPhone);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof Error ? e.message : "invalid-input";
    const status = code === "forbidden" ? 403 : code === "not-found" ? 404 : 400;
    return NextResponse.json({ code }, { status });
  }
}
