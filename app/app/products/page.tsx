"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { setProductStatus } from "@/lib/products/actions";
import { useOutboxCount } from "@/lib/offline/useOutbox";

type Item = { id: string; title: string; priceINR: number; stock: number; status: string; images: string[] };

export default function ProductsPage() {
  const t = useTranslations("create");
  const te = useTranslations("auth.errors");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const queued = useOutboxCount();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setItems(j.products);
        else setError(te("somethingWrong"));
      })
      .catch(() => setError(te("somethingWrong")));
  }, [te]);

  async function toggle(it: Item) {
    const next = it.status === "LIVE" ? "PAUSED" : ("LIVE" as const);
    const r = await setProductStatus(it.id, next);
    if (!r.ok) {
      setError(te("somethingWrong"));
      return;
    }
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, status: next } : x)));
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("myProducts")}</h1>
      <ListenButton text={`${t("myProducts")}. ${items.length} items.`} />
      <AuthError message={error} />
      {queued > 0 && (
        <p role="status" className="rounded-[12px] bg-[var(--clay-soft)] p-3 text-sm font-bold">
          ⏳ {queued} waiting to sync
        </p>
      )}
      {items.length === 0 ? (
        <EmptyState
          icon="🧺"
          title={t("noProducts")}
          hint={t("noProductsHint")}
          actions={
            <Link href="/app/create" className="flex min-h-[56px] items-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]">
              {t("newListing")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((it) => (
            <li key={it.id} className="flex flex-col gap-2">
              <ProductCard title={it.title} price={it.priceINR} image={it.images[0]} status={it.status as "LIVE" | "PAUSED" | "DRAFT"} />
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">Stock: {it.stock}</span>
                <button
                  type="button"
                  onClick={() => void toggle(it)}
                  aria-pressed={it.status === "PAUSED"}
                  className="min-h-[56px] rounded-full border-2 px-5 text-base font-bold"
                  style={{ borderColor: "var(--border)" }}
                >
                  {it.status === "LIVE" ? t("pause") : t("resume")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
