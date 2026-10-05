import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function staffOnly(role?: string): boolean {
  return !!role && ["SAKHI", "ADMIN", "MENTOR"].includes(role);
}

/** My mentees with progress + stuck points (no products / no orders / lessons left). */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !staffOnly(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const women = await db.user.findMany({
    where: { sakhiId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const out = [];
  for (const w of women) {
    const shops = await db.shop.findMany({ where: { ownerId: w.id }, select: { id: true } });
    const shopIds = shops.map((s) => s.id);
    const [products, orders, lessons] = await Promise.all([
      db.product.count({ where: { shopId: { in: shopIds } } }),
      db.order.count({ where: { shopId: { in: shopIds } } }),
      db.lessonProgress.count({ where: { userId: w.id, status: "DONE" } }),
    ]);
    const stuck: string[] = [];
    if (products === 0) stuck.push("no-products");
    else if (orders === 0) stuck.push("no-orders");
    if (lessons < 3) stuck.push("few-lessons");
    out.push({
      id: w.id,
      name: w.name || w.phone,
      phone: `${w.phone.slice(0, 2)}••••${w.phone.slice(6)}`,
      village: w.village || "",
      locale: w.locale,
      products,
      orders,
      lessons,
      stuck,
    });
  }
  return NextResponse.json({ ok: true, mentees: out });
}

/** Assisted onboarding: link a woman's account (by phone) to me. */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !staffOnly(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const woman = await db.user.findUnique({ where: { phone: parsed.data.phone } });
  if (!woman || woman.deletedAt) return NextResponse.json({ code: "no-account" }, { status: 404 });
  if (woman.id === session.user.id) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  await db.user.update({ where: { id: woman.id }, data: { sakhiId: session.user.id } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "sakhi.assigned", meta: JSON.stringify({ womanId: woman.id }) },
  });
  return NextResponse.json({ ok: true, name: woman.name || woman.phone });
}
