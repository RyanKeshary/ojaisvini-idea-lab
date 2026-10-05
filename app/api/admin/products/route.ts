import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

/** Product moderation queue (newest first). */
export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const status = new URL(req.url).searchParams.get("status") || "";
  const products = await db.product.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { shop: { select: { name: true, slug: true, owner: { select: { phone: true } } } } },
  });
  return NextResponse.json({
    ok: true,
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.priceINR,
      status: p.status,
      shop: p.shop.name,
      slug: p.shop.slug,
      createdAt: p.createdAt,
    })),
  });
}

/** Moderate: pause (hide) or restore a listing (audited). */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z
    .object({ id: z.string().min(1).max(64), status: z.enum(["LIVE", "PAUSED"]) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  await db.product.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "admin.product", meta: JSON.stringify(parsed.data) },
  });
  return NextResponse.json({ ok: true });
}
