"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { inr } from "@/lib/utils";

type Item = { title: string; price: number; qty: number };

/** Printable receipt + tracking link (buyer keeps phone handy for tracking). */
export default function SuccessPage() {
  const t = useTranslations("shop");
  const params = useParams<{ slug: string; orderId: string }>();
  const [order, setOrder] = useState<{ id: string; shopName: string; total: number; payStatus: string; items: Item[] } | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch(`/api/pay/order/${params.orderId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setOrder(j.order);
      })
      .catch(() => {});
  }, [params.orderId]);

  if (!order) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-10" aria-label={t("receipt")}>
        <div className="skeleton h-40 rounded-[20px]" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pb-16 pt-6">
      <section aria-label={t("receipt")} className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)", borderTop: "6px dashed var(--border)" }}>
        <h1 className="display text-3xl font-bold">{t("receipt")}</h1>
        <p className="text-base opacity-70">{order.shopName}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {order.items.map((i, ix) => (
            <li key={ix} className="flex justify-between text-base">
              <span>{i.title} × {i.qty}</span>
              <span className="font-bold">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="display mt-2 text-3xl font-bold">{inr(order.total)}</p>
        <p className="mt-1 text-sm opacity-70">{t("orderId")}: {order.id}</p>
        <p className="text-sm opacity-70">{t("demoPay")}</p>
      </section>
      <button type="button" onClick={() => window.print()} className="min-h-[56px] text-base font-bold underline" style={{ color: "var(--indigo)" }}>
        Print / PDF
      </button>
      <label className="flex flex-col gap-1 text-base font-bold">
        {t("yourPhone")}
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric"
          placeholder="98XXXXXXXX"
          className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-xl"
          style={{ borderColor: "var(--border)" }}
        />
      </label>
      <Link
        href={phone.length === 10 ? `/shop/${params.slug}/track?orderId=${order.id}&phone=${phone}` : "#"}
        aria-disabled={phone.length !== 10}
        className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)] aria-disabled:opacity-50"
      >
        {t("trackOrder")}
      </Link>
      <Link href={`/shop/${params.slug}`} className="place-self-center text-base font-bold underline" style={{ color: "var(--indigo)" }}>
        {t("backToShop")}
      </Link>
    </main>
  );
}
