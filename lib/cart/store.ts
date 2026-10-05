"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: string;
};

type Cart = {
  shopSlug: string;
  items: CartItem[];
  add: (shopSlug: string, item: Omit<CartItem, "qty">, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

/**
 * Single-shop guest cart (no buyer login). Adding from another shop replaces
 * the cart — returns false when that happened so UI can say so.
 */
export const useCart = create<Cart>()(
  persist(
    (set, get) => ({
      shopSlug: "",
      items: [],
      add: (shopSlug, item, qty = 1) => {
        const replaced = get().shopSlug !== "" && get().shopSlug !== shopSlug;
        const items =
          get().shopSlug === shopSlug
            ? (() => {
                const found = get().items.find((i) => i.productId === item.productId);
                if (found) {
                  return get().items.map((i) =>
                    i.productId === item.productId ? { ...i, qty: Math.min(50, i.qty + qty) } : i
                  );
                }
                return [...get().items, { ...item, qty }];
              })()
            : [{ ...item, qty }];
        set({ shopSlug, items });
        return !replaced;
      },
      setQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(50, qty) } : i)),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [], shopSlug: "" }),
      count: () => get().items.reduce((a, i) => a + i.qty, 0),
      subtotal: () => get().items.reduce((a, i) => a + i.qty * i.price, 0),
    }),
    {
      name: "ojas-cart",
      partialize: (s) => ({ shopSlug: s.shopSlug, items: s.items }),
    }
  )
);
