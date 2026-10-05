import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { PriceTag } from "@/components/ui/PriceTag";
import { ListenButton } from "@/components/voice/ListenButton";
import { BuyBox } from "@/components/shop/BuyBox";
import { inr } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }): Promise<Metadata> {
  const { slug, id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { shop: true } });
  if (!product || product.shop.slug !== slug) return { title: "Product not found — Ojasvini" };
  return {
    title: `${product.title} · ${inr(product.priceINR)} — Ojasvini`,
    description: product.description.slice(0, 160),
    openGraph: { title: product.title, description: product.description.slice(0, 160) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const t = await getTranslations("shop");
  const product = await db.product.findUnique({ where: { id }, include: { shop: true, } });
  if (!product || product.shop.slug !== slug || product.status !== "LIVE") notFound();
  const shop = await db.shop.findUnique({ where: { id: product.shopId }, include: { owner: { select: { phone: true } } } });
  const images = JSON.parse(product.images) as string[];
  const attrs = JSON.parse(product.attributes) as { weight?: string; shelfLife?: string; fulfillment?: string };
  const waOrder = `https://wa.me/91${shop?.owner.phone ?? ""}?text=${encodeURIComponent(`${t("orderViaWhatsapp")}: ${product.title} (${inr(product.priceINR)})`)}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pb-16 pt-6">
      <Link href={`/shop/${slug}`} className="text-base font-bold underline" style={{ color: "var(--indigo)" }}>
        ← {product.shop.name}
      </Link>
      <div className="grid grid-cols-2 gap-2">
        {images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={product.title} className="aspect-square w-full rounded-[12px] object-cover" />
        ))}
      </div>
      <h1 className="display text-3xl font-bold">{product.title}</h1>
      <p className="text-lg opacity-80">{product.description}</p>
      <div className="flex items-center gap-2">
        <PriceTag amount={product.priceINR} />
        <span className="text-sm opacity-70">{product.category}</span>
      </div>
      {(attrs.weight || attrs.shelfLife) && (
        <p className="text-base opacity-75">
          {[attrs.weight, attrs.shelfLife].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="text-base font-bold">Stock: {product.stock}</p>
      <ListenButton text={`${product.title}. ${product.description}. ${inr(product.priceINR)}`} />
      <BuyBox
        shopSlug={slug}
        product={{ id: product.id, title: product.title, price: product.priceINR, image: images[0] || "" }}
        waOrder={waOrder}
        orderLabel={t("orderViaWhatsapp")}
      />
    </main>
  );
}
