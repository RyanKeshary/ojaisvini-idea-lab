"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { EarningsCounter } from "@/components/ui/EarningsCounter";
import { ListenButton } from "@/components/voice/ListenButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { AuthError } from "@/components/auth/AuthError";
import { inr } from "@/lib/utils";
import { usePrefs } from "@/lib/store/prefs";

type Insight = { summary: string; s1: string; s2: string; s3: string };
type Order = { id: string; buyerName: string; total: number; status: string; payStatus: string };

/** One-stop seller dashboard: sales, action-needed orders, payouts, insights. */
export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const te = useTranslations("auth.errors");
  const { locale } = usePrefs();
  const [orders, setOrders] = useState<Order[]>([]);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [settled, setSettled] = useState(0);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setOrders(j.orders);
        else setError(te("somethingWrong"));
      })
      .catch(() => setError(te("somethingWrong")));
    fetch(`/api/insights?locale=${locale}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setInsights({ summary: j.summary, s1: j.s1, s2: j.s2, s3: j.s3 });
      })
      .catch(() => {});
    fetch("/api/payouts")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setSettled(j.settledTotal);
          setPending(j.pendingTotal);
        }
      })
      .catch(() => {});
  }, [locale, te]);

  const actionNeeded = orders.filter((o) => ["PLACED", "ACCEPTED", "PREPARING", "READY"].includes(o.status));
  const weekRevenue = orders
    .filter((o) => o.payStatus === "PAID" || o.payStatus === "COD_PENDING")
    .reduce((a, o) => a + o.total, 0);

  return (
    <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 pb-32 md:grid-cols-3">
      <h1 className="display text-4xl font-bold md:col-span-3">{t("title")}</h1>
      <AuthError message={error} />
      <div className="md:col-span-1">
        <EarningsCounter value={weekRevenue} label={t("revenue")} />
      </div>
      <section className="rounded-[20px] border bg-[var(--card)] p-5 md:col-span-1" style={{ borderColor: "var(--border)" }} aria-label={t("actionNeeded")}>
        <h2 className="display text-xl font-bold">{t("actionNeeded")} ({actionNeeded.length})</h2>
        <ul className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">
          {actionNeeded.slice(0, 6).map((o) => (
            <li key={o.id}>
              <Link href={`/app/orders/${o.id}`} className="flex items-center justify-between gap-2 rounded-[12px] border px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm font-bold">{o.buyerName} · {inr(o.total)}</span>
                <StatusPill status={o.status} />
              </Link>
            </li>
          ))}
          {actionNeeded.length === 0 && <li className="text-sm opacity-70">{t("allCaughtUp")}</li>}
        </ul>
      </section>
      <section className="rounded-[20px] border bg-[var(--card)] p-5 md:col-span-1" style={{ borderColor: "var(--border)" }} aria-label={t("payouts")}>
        <h2 className="display text-xl font-bold">{t("payouts")}</h2>
        <p className="mt-1 text-base">{t("settled")}: <span className="font-bold">{inr(settled)}</span></p>
        <p className="text-base">{t("pending")}: <span className="font-bold">{inr(pending)}</span></p>
        <Link href="/app/payouts" className="mt-2 inline-block min-h-[48px] text-sm font-bold underline" style={{ color: "var(--indigo)" }}>
          {t("payouts")} →
        </Link>
      </section>
      {insights && (
        <section className="rounded-[20px] border bg-[var(--card)] p-5 md:col-span-3" style={{ borderColor: "var(--indigo)" }} aria-label="Insights">
          <h2 className="display text-xl font-bold">💡 {t("tip")}</h2>
          <p className="mt-1 text-base">{insights.summary}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {[insights.s1, insights.s2, insights.s3].map((s, i) => (
              <li key={i} className="text-base">• {s}</li>
            ))}
          </ul>
          <div className="mt-2">
            <ListenButton text={`${insights.summary} ${insights.s1} ${insights.s2} ${insights.s3}`} compact />
          </div>
        </section>
      )}
      <nav className="flex flex-wrap gap-2 md:col-span-3" aria-label="Dashboard sections">
        {[
          ["/app/products", t("products")],
          ["/app/orders", t("orders")],
          ["/app/learn", t("learn")],
          ["/app/schemes", t("schemes")],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="flex min-h-[56px] items-center rounded-[12px] border-2 px-4 text-base font-bold" style={{ borderColor: "var(--border)" }}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
