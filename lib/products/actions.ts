"use server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** Pause / resume a listing (seller owns the shop). Voice-confirmed in UI. */
export async function setProductStatus(
  productId: string,
  status: "LIVE" | "PAUSED"
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { shop: { select: { ownerId: true } } },
  });
  if (!product || product.shop.ownerId !== session.user.id) return { ok: false };
  await db.product.update({ where: { id: productId }, data: { status } });
  return { ok: true };
}
