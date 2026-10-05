"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { OrderTimeline, type OrderStage } from "@/components/ui/OrderTimeline";
import { StatusPill } from "@/components/ui/StatusPill";
import { AuthError } from "@/components/auth/AuthError";
import { inr } from "@/lib/utils";

type Tracked = {
  id: string;
  shopName: string;
  status: string;
  payStatus: string;
  total: number;
  items: Array<{ title: string; price: number; qty: number }>;
  trackingId: string | null;
  events: Array<{ status: string; note: string; at: string }>;
};

const TIMELINE: OrderStage[] = ["PENDING_PAYMENT", "PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "PAYOUT_SETTLED"];

function TrackInner() {
  const t = useTranslations("shop");
  const te = useTranslations("auth.errors");
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState<string | null>(null);
  void params;

  useEffect(() => {
    const orderId = sp.get("orderId") || "";
    const phone = sp.get("phone") || "";
    if (!orderId || !/^([6-9]\d{9})$/.test(phone)) {
      setError(te("somethingWrong"));
      return;
    }
    fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${phone}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setOrder(j.order);
        else setError(te("somethingWrong"));
      })
      .catch(() => setError(te("somethingWrong")));
  }, [sp, te]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pb-16 pt-6">
      <h1 className="display text-3xl font-bold">{t("trackOrder")}</h1>
      <AuthError message={error} />
      {order && (
        <>
          <div className="flex items-center gap-2">
            <StatusPill status={order.status} />
            <StatusPill status={order.payStatus} />
          </div>
          <p className="text-lg">{order.shopName} · <span className="font-bold">{inr(order.total)}</span></p>
          {order.trackingId && <p className="text-sm opacity-70">Tracking: {order.trackingId}</p>}
          <OrderTimeline current={TIMELINE.includes(order.status as OrderStage) ? (order.status as OrderStage) : "PLACED"} />
          <ul className="flex flex-col gap-1 rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
            {order.events.map((e, i) => (
              <li key={i} className="text-sm">
                <span className="font-bold">{e.status.replaceAll("_", " ").toLowerCase()}</span>
                {e.note ? ` — ${e.note}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackInner />
    </Suspense>
  );
}
