"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { inr } from "@/lib/utils";

type OrderItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  total: number;
  status: string;
  payStatus: string;
  createdAt: string;
  items: string;
  shop?: { name: string; slug: string };
};

const FILTERS = ["", "PLACED", "ACCEPTED", "PREPARING", "READY", "DELIVERED", "PENDING_PAYMENT"] as const;

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const te = useTranslations("auth.errors");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const prevCountRef = useRef<number>(0);

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders${filter ? `?status=${filter}` : ""}`);
      const j = await res.json();
      if (j.ok) {
        setOrders(j.orders);
        setLastUpdated(new Date());
        setError(null);
        const placedCount = j.orders.filter((o: Order) => o.status === "PLACED").length;
        if (placedCount > prevCountRef.current && prevCountRef.current !== 0) {
          playChime();
        }
        prevCountRef.current = placedCount;
      } else {
        if (isManual) setError(te("somethingWrong"));
      }
    } catch {
      if (isManual) setError(te("somethingWrong"));
    } finally {
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  }, [filter, te]);

  // Initial fetch and 3-second live auto-polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function quickAdvance(orderId: string, toStatus: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdvancingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: toStatus }),
      });
      const j = await res.json();
      if (j.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: toStatus } : o))
        );
      }
    } catch {}
    finally {
      setAdvancingId(null);
    }
  }

  const fresh = orders.filter((o) => o.status === "PLACED").length;
  const summary = `${t("title")}. ${orders.length} orders. ${fresh} new orders.`;

  function parseItems(itemsStr: string): OrderItem[] {
    try {
      return JSON.parse(itemsStr) as OrderItem[];
    } catch {
      return [];
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32 pt-2">
      {/* Top Header with Live Badge & Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="display text-3xl md:text-4xl font-bold">{t("title")}</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs opacity-60 mt-0.5">
            Auto-syncs every 3s · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {fresh > 0 && (
            <span className="rounded-full bg-[var(--madder)] px-3 py-1 text-xs font-bold text-white animate-bounce" role="status">
              {fresh} {t("newOrders")}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-[var(--card)] shadow-xs transition-transform active:scale-95"
            style={{ borderColor: "var(--border)" }}
            aria-label="Refresh orders"
            title="Refresh now"
          >
            <span className={`text-base ${refreshing ? "animate-spin" : ""}`}>🔄</span>
          </button>
        </div>
      </div>

      <ListenButton text={summary} />
      <AuthError message={error} />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label={t("status")}>
        {FILTERS.map((f) => {
          const count = f === "" ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 text-xs md:text-sm font-bold transition-all"
              style={{
                borderColor: filter === f ? "var(--turmeric)" : "var(--border)",
                background: filter === f ? "var(--clay-soft)" : "var(--card)",
              }}
            >
              <span>{f === "" ? t("title") : f === "PENDING_PAYMENT" ? "In Checkout" : f.replaceAll("_", " ").toLowerCase()}</span>
              {count > 0 && (
                <span className="rounded-full bg-[var(--border)] px-1.5 py-0.2 text-[10px] opacity-80">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState icon="🧺" title={t("noOrders")} hint={t("emptyHint")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => {
            const parsed = parseItems(o.items);
            const isFresh = o.status === "PLACED";
            const isPendingPay = o.status === "PENDING_PAYMENT";
            const isAccepted = o.status === "ACCEPTED";
            const isPreparing = o.status === "PREPARING";
            const isReady = o.status === "READY";

            return (
              <li key={o.id}>
                <div
                  className="flex flex-col gap-3 rounded-[20px] border bg-[var(--card)] p-4 shadow-sm transition-all"
                  style={{
                    borderColor: isFresh ? "var(--turmeric)" : isPendingPay ? "var(--indigo)" : "var(--border)",
                    boxShadow: isFresh ? "0 4px 14px rgba(230, 160, 40, 0.15)" : undefined,
                  }}
                >
                  <Link
                    href={`/app/orders/${o.id}`}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-lg font-bold">{o.buyerName}</p>
                        {isFresh && (
                          <span className="rounded-full bg-[var(--turmeric)]/20 text-[var(--madder)] px-2 py-0.5 text-xs font-bold">
                            NEW
                          </span>
                        )}
                        {isPendingPay && (
                          <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-xs font-bold">
                            Payment Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold opacity-80 mt-0.5">
                        {inr(o.total)} · <span className="uppercase">{o.payStatus.replaceAll("_", " ")}</span>
                      </p>

                      {/* Items Preview */}
                      {parsed.length > 0 && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-1">
                          {parsed.map((i) => `${i.title} × ${i.qty}`).join(", ")}
                        </p>
                      )}

                      <p className="text-[11px] opacity-50 mt-1">
                        {new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                        at {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusPill status={o.status} />
                      <span className="text-xs font-bold text-[var(--indigo)] underline">Details →</span>
                    </div>
                  </Link>

                  {/* One-Tap Quick Advance Actions right on the card */}
                  {isFresh && (
                    <div className="flex gap-2 border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        disabled={advancingId === o.id}
                        onClick={(e) => quickAdvance(o.id, "ACCEPTED", e)}
                        className="flex-1 min-h-[46px] rounded-[12px] bg-emerald-600 text-white font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {advancingId === o.id ? "Updating..." : "✓ Accept Order"}
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="flex gap-2 border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        disabled={advancingId === o.id}
                        onClick={(e) => quickAdvance(o.id, "PREPARING", e)}
                        className="flex-1 min-h-[46px] rounded-[12px] bg-[var(--turmeric)] text-[var(--primary-ink)] font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {advancingId === o.id ? "Updating..." : "👩‍🍳 Start Preparing"}
                      </button>
                    </div>
                  )}

                  {isPreparing && (
                    <div className="flex gap-2 border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        disabled={advancingId === o.id}
                        onClick={(e) => quickAdvance(o.id, "READY", e)}
                        className="flex-1 min-h-[46px] rounded-[12px] bg-blue-600 text-white font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {advancingId === o.id ? "Updating..." : "📦 Mark Ready for Pickup"}
                      </button>
                    </div>
                  )}

                  {isReady && (
                    <div className="flex gap-2 border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        disabled={advancingId === o.id}
                        onClick={(e) => quickAdvance(o.id, "PICKED_UP", e)}
                        className="flex-1 min-h-[46px] rounded-[12px] bg-purple-600 text-white font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {advancingId === o.id ? "Updating..." : "🚚 Mark Picked Up"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer Navigation */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Link
          href="/app/payouts"
          className="flex min-h-[52px] items-center justify-center rounded-[12px] border-2 text-sm md:text-base font-bold transition-all hover:bg-[var(--card)]"
          style={{ borderColor: "var(--border)" }}
        >
          💰 {t("payouts")}
        </Link>
        <Link
          href="/app/orders/pool"
          className="flex min-h-[52px] items-center justify-center rounded-[12px] border-2 text-sm md:text-base font-bold transition-all hover:bg-[var(--card)]"
          style={{ borderColor: "var(--border)" }}
        >
          📦 {t("poolTitle")}
        </Link>
      </div>
    </main>
  );
}
