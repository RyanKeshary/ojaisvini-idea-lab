import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { StorefrontHero } from "@/components/ui/StorefrontHero";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusPill } from "@/components/ui/StatusPill";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop) return { title: "Shop not found — Ojasvini" };
  const count = await db.product.count({ where: { shopId: shop.id, status: "LIVE" } });
  return {
    title: `${shop.name} — Ojasvini`,
    description: `${shop.name}: ${count} handmade products. Speak. Snap. Sell.`,
    openGraph: {
      title: shop.name,
      description: `${count} products · Ojasvini`,
      images: [`/api/og/${slug}`],
    },
  };
}

/** Public storefront: SSR, SEO-ready, no login. Checkout lands in Phase 4. */
export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("shop");
  const shop = await db.shop.findUnique({ where: { slug }, include: { owner: { select: { phone: true } } } });
  if (!shop || !shop.isLive) notFound();
  const products = await db.product.findMany({
    where: { shopId: shop.id, status: "LIVE" },
    orderBy: { createdAt: "desc" },
  });
  const waAsk = `https://wa.me/91${shop.owner.phone}?text=${encodeURIComponent(`${t("shareTitle")}: ${shop.name}`)}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 pb-16 pt-6">
      <p>
        <span className="rounded-full bg-[var(--leaf)] px-3 py-1 text-sm font-bold text-white">{t("liveBadge")}</span>
      </p>
      <StorefrontHero shopName={shop.name} greeting={shop.bio || ""} />
      <div className="flex flex-wrap gap-2">
        <a href={waAsk} target="_blank" rel="noreferrer" className="flex min-h-[56px] items-center rounded-full bg-[var(--leaf)] px-5 text-base font-bold text-white">
          {t("askSeller")}
        </a>
        <StatusPill status="LIVE" />
      </div>

      {products.length === 0 ? (
        <p className="rounded-[20px] border border-dashed p-8 text-center text-lg opacity-70" style={{ borderColor: "var(--border)" }}>
          {t("emptyShop")}
        </p>
      ) : (
        <section aria-label={shop.name} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {products.map((p) => {
            const images = JSON.parse(p.images) as string[];
            return (
              <Link key={p.id} href={`/shop/${slug}/p/${p.id}`} aria-label={p.title}>
                <ProductCard title={p.title} price={p.priceINR} image={images[0]} status="LIVE" />
              </Link>
            );
          })}
        </section>
      )}

      <section aria-label={t("deliveryInfo")} className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <h2 className="display text-xl font-bold">{t("deliveryInfo")}</h2>
        <p className="mt-1 text-base opacity-75">{t("reviewsSoon")}</p>
        <p className="mt-2 text-base font-bold">{t("deliveryLine")}</p>
      </section>
    </main>
  );
}
