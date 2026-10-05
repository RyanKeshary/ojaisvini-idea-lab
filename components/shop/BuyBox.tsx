"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCart } from "@/lib/cart/store";
import { toast } from "@/components/ui/Toast";

/** Buyer purchase box: cart + buy-now + WhatsApp order (Phase 4 online pay later). */
export function BuyBox({
  shopSlug,
  product,
  waOrder,
  orderLabel,
}: {
  shopSlug: string;
  product: { id: string; title: string; price: number; image: string };
  waOrder: string;
  orderLabel: string;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const { add, count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  function addToCart(): boolean {
    const kept = add(shopSlug, { productId: product.id, title: product.title, price: product.price, image: product.image });
    if (!kept) toast(t("cart"));
    return kept;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            addToCart();
            setCartOpen(true);
          }}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-[20px] border-2 px-4 text-lg font-bold"
          style={{ borderColor: "var(--turmeric)" }}
        >
          <ShoppingCart aria-hidden /> {t("addToCart")}
        </button>
        <button
          type="button"
          onClick={() => {
            addToCart();
            router.push(`/shop/${shopSlug}/checkout?p=${product.id}&title=${encodeURIComponent(product.title)}&price=${product.price}&img=${encodeURIComponent(product.image)}`);
          }}
          className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-4 text-lg font-bold text-[var(--primary-ink)]"
        >
          {t("buyNow")}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`${t("cart")}: ${count()}`}
        className="min-h-[56px] text-base font-bold underline"
        style={{ color: "var(--indigo)" }}
      >
        {t("cart")} ({count()})
      </button>
      <a
        href={waOrder}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--leaf)] px-6 text-lg font-bold text-white"
      >
        {orderLabel}
      </a>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
