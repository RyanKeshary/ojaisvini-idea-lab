import { db } from "@/lib/db";

/**
 * Grounded seller context for the assistant (no PII beyond her own shop).
 * Capped sizes; last 30 days of orders/earnings + catalog + progress.
 */
export async function sellerContext(userId: string): Promise<string> {
  const shops = await db.shop.findMany({
    where: { ownerId: userId },
    include: { products: { where: { status: "LIVE" }, take: 10 } },
  });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orders = await db.order.findMany({
    where: { shopId: { in: shops.map((s) => s.id) }, createdAt: { gte: since } },
    take: 100,
  });
  const paid = orders.filter((o) => o.payStatus === "PAID" || o.payStatus === "COD_PENDING");
  const revenue = paid.reduce((a, o) => a + o.total, 0);
  const lessonsDone = await db.lessonProgress.count({ where: { userId, status: "DONE" } });
  const schemeCount = await db.scheme.count();

  const lines = [
    `Shops: ${shops.map((s) => s.name).join("; ") || "none yet"}`,
  ];
  for (const s of shops.slice(0, 2)) {
    lines.push(
      `Products in ${s.name}: ${s.products.map((p) => `${p.title} ₹${p.priceINR} (stock ${p.stock})`).join("; ") || "none"}`
    );
  }
  lines.push(
    `Last 30 days: ${orders.length} orders, ${paid.length} paid, revenue ₹${revenue}.`,
    `Lessons completed: ${lessonsDone}. Schemes in finder: ${schemeCount}.`
  );
  const byProduct = new Map<string, number>();
  for (const o of paid) {
    try {
      const items = JSON.parse(o.items) as Array<{ title: string; qty: number }>;
      for (const i of items) byProduct.set(i.title, (byProduct.get(i.title) || 0) + i.qty);
    } catch {}
  }
  const top = [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top) lines.push(`Bestseller: ${top[0]} (${top[1]} sold).`);
  return lines.join("\n");
}
