import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

/** Impact metrics: onboarded, first-sale time, GMV, languages. */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const [women, shops, products, orders, schemes, lessons, posts, reports] = await Promise.all([
    db.user.count({ where: { role: "WOMAN", deletedAt: null } }),
    db.shop.count(),
    db.product.count({ where: { status: "LIVE" } }),
    db.order.findMany({ where: { payStatus: { in: ["PAID", "COD_PENDING"] } }, select: { total: true } }),
    db.scheme.count(),
    db.lessonProgress.count({ where: { status: "DONE" } }),
    db.post.count({ where: { status: "VISIBLE" } }),
    db.report.count({ where: { status: "OPEN" } }),
  ]);
  const gmv = orders.reduce((a, o) => a + o.total, 0);

  // First-sale time: median days from user creation to first LIVE product.
  const sellers = await db.user.findMany({
    where: { role: "WOMAN", deletedAt: null },
    select: { id: true, createdAt: true },
    take: 500,
  });
  const gaps: number[] = [];
  for (const s of sellers) {
    const first = await db.product.findFirst({
      where: { shop: { ownerId: s.id }, status: { in: ["LIVE", "PAUSED"] } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (first) gaps.push((first.createdAt.getTime() - s.createdAt.getTime()) / 86400000);
  }
  gaps.sort((a, b) => a - b);
  const medianDays = gaps.length ? Math.round(gaps[Math.floor(gaps.length / 2)] * 10) / 10 : null;

  const byLocale = await db.user.groupBy({ by: ["locale"], where: { deletedAt: null }, _count: { locale: true } });

  return NextResponse.json({
    ok: true,
    metrics: {
      women: women,
      shops,
      liveProducts: products,
      paidOrders: orders.length,
      gmv,
      medianFirstSaleDays: medianDays,
      schemes,
      lessonsDone: lessons,
      posts,
      openReports: reports,
      byLocale: byLocale.map((b) => ({ locale: b.locale, count: b._count.locale })),
    },
  });
}
