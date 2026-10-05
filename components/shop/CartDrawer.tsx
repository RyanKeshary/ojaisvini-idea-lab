"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useCart } from "@/lib/cart/store";
import { inr } from "@/lib/utils";

/** Buyer cart drawer (bottom sheet mobile, side panel desktop via Sheet). */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("shop");
  const { shopSlug, items, setQty, remove, subtotal } = useCart();
  return (
    <Sheet open={open} onClose={onClose} title={t("cart")}>
      {items.length === 0 ? (
        <p className="py-8 text-center text-lg opacity-70">{t("cartEmpty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 rounded-[12px] border p-2" style={{ borderColor: "var(--border)" }}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{i.title}</p>
                  <p className="text-sm opacity-70">{inr(i.price)} × {i.qty}</p>
                </div>
                <button type="button" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="Decrease" className="grid min-h-[48px] min-w-[48px] place-items-center rounded-full border" style={{ borderColor: "var(--border)" }}>
                  <Minus size={16} aria-hidden />
                </button>
                <span className="w-6 text-center font-bold" aria-label={`Quantity ${i.qty}`}>{i.qty}</span>
                <button type="button" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="Increase" className="grid min-h-[48px] min-w-[48px] place-items-center rounded-full border" style={{ borderColor: "var(--border)" }}>
                  <Plus size={16} aria-hidden />
                </button>
                <button type="button" onClick={() => remove(i.productId)} aria-label="Remove" className="grid min-h-[48px] min-w-[48px] place-items-center rounded-full border" style={{ borderColor: "var(--border)" }}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <p className="display text-2xl font-bold">{inr(subtotal())}</p>
          <Link
            href={`/shop/${shopSlug}/checkout`}
            onClick={onClose}
            className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]"
          >
            {t("checkout")}
          </Link>
        </div>
      )}
    </Sheet>
  );
}
