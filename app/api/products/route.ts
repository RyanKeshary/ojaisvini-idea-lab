import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getOrCreateShop } from "@/lib/shop";
import { listingSchema } from "@/lib/ai/schema";

const publishSchema = z.object({
  draft: listingSchema,
  priceINR: z.number().int().min(1).max(1000000),
  stock: z.number().int().min(1).max(100000),
  imageUrls: z.array(z.string().regex(/^\/uploads\/[A-Za-z0-9_.-]+$/)).min(1).max(4),
  fulfillment: z.enum(["pickup", "delivery", "both"]).default("both"),
});

/** Publish a listing live + ensure shop. Returns the shareable shop URL. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid-input", issues: parsed.error.issues }, { status: 400 });
  }
  const shop = await getOrCreateShop(session.user.id);
  const { draft, priceINR, stock, imageUrls, fulfillment } = parsed.data;
  const product = await db.product.create({
    data: {
      shopId: shop.id,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      tags: JSON.stringify(draft.tags),
      priceINR,
      stock,
      images: JSON.stringify(imageUrls),
      attributes: JSON.stringify({ ...draft.attributes, fulfillment }),
      status: "LIVE",
      aiMeta: JSON.stringify({ suggestedPrice: draft.suggestedPrice, mocked: true }),
    },
  });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "product.published", meta: JSON.stringify({ productId: product.id }) },
  });
  revalidateTag(`shop:${shop.slug}`);
  return NextResponse.json({ ok: true, productId: product.id, shopSlug: shop.slug, shopName: shop.name });
}

/** My products (seller). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const shops = await db.shop.findMany({ where: { ownerId: session.user.id }, select: { id: true } });
  const products = await db.product.findMany({
    where: { shopId: { in: shops.map((s) => s.id) } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ok: true,
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      priceINR: p.priceINR,
      stock: p.stock,
      status: p.status,
      images: JSON.parse(p.images) as string[],
    })),
  });
}
