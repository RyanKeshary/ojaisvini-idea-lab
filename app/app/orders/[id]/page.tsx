"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { OrderTimeline, type OrderStage } from "@/components/ui/OrderTimeline";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { maskPhone, inr } from "@/lib/utils";
import { queueWrite } from "@/lib/offline/sync";
import { toast } from "@/components/ui/Toast";

type Detail = {
  id: string;
  buyerName: string;
  buyerPhone: string;
  address: string;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  payStatus: string;
  events: Array<{ status: string; note: string; createdAt: string }>;
};

const NEXT: Record<string, { to: string; key: string }[]> = {
  PLACED: [{ to: "ACCEPTED", key: "accept" }],
  ACCEPTED: [{ to: "PREPARING", key: "markPreparing" }],
  PREPARING: [{ to: "READY", key: "markReady" }],
  READY: [{ to: "PICKED_UP", key: "markPicked" }],
  PICKED_UP: [{ to: "OUT_FOR_DELIVERY", key: "markOut" }],
  OUT_FOR_DELIVERY: [{ to: "DELIVERED", key: "markDelivered" }],
};

export default function OrderDetailPage() {
  const t = useTranslations("orders");
  const te = useTranslations("auth.errors");
  const tp = useTranslations("pwa");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch(`/api/orders/${params.id}`).then((x) => x.json());
      if (r.ok) setOrder(r.order);
      else setError(te("somethingWrong"));
    } catch {
      setError(te("somethingWrong"));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function advance(to: string) {
    setBusy(true);
    setError(null);
    // Offline: queue the status change; server validates on sync.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await queueWrite("order-advance", { orderId: params.id, to });
        toast(tp("queuedPublish"));
      } catch {
        setError(te("somethingWrong"));
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      const r = await fetch(`/api/orders/${params.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await fetch(`/api/orders/${params.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function refund() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/pay/refund", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: params.id }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-0 py-4" aria-label={t("title")}>
        <div className="skeleton h-24 rounded-[20px]" />
        <div className="skeleton h-48 rounded-[20px]" />
      </main>
    );
  }

  const items = JSON.parse(order.items) as Array<{ title: string; price: number; qty: number }>;
  const addr = JSON.parse(order.address) as { line?: string; pincode?: string; fulfillment?: string };
  const waBuyer = `https://wa.me/91${order.buyerPhone}?text=${encodeURIComponent(`Namaskar ${order.buyerName}! Order ${order.id.slice(-6)}: ${order.status}`)}`;
  const speakSummary = `Order ${inr(order.total)}. ${order.buyerName}. ${order.status}.`;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <div className="flex items-center gap-2">
        <StatusPill status={order.status} />
        <StatusPill status={order.payStatus} />
      </div>
      <h1 className="display text-3xl font-bold">{order.buyerName}</h1>
      <p className="text-base opacity-70">{maskPhone(order.buyerPhone)} · {addr.line} · {addr.pincode} · {addr.fulfillment}</p>
      <ListenButton text={speakSummary} />
      <AuthError message={error} />
      <ul className="flex flex-col gap-1 rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
        {items.map((i, ix) => (
          <li key={ix} className="flex justify-between text-base">
            <span>{i.title} × {i.qty}</span>
            <span className="font-bold">{inr(i.price * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between text-base font-bold">
          <span>{t("total")}</span>
          <span>{inr(order.total)}</span>
        </li>
      </ul>
      <OrderTimeline current={(["PENDING_PAYMENT","PLACED","ACCEPTED","PREPARING","READY","PICKED_UP","OUT_FOR_DELIVERY","DELIVERED","PAYOUT_SETTLED"] as OrderStage[]).includes(order.status as OrderStage) ? (order.status as OrderStage) : "PLACED"} />
      <div className="flex flex-col gap-2">
        {(NEXT[order.status] || []).map((n) => (
          <BigButton key={n.to} onClick={() => void advance(n.to)} state={busy ? "loading" : "idle"}>
            {t(n.key)}
          </BigButton>
        ))}
        {["PLACED", "ACCEPTED"].includes(order.status) && (
          <BigButton variant="secondary" onClick={cancel}>{order.status === "PLACED" ? t("reject") : t("cancel")}</BigButton>
        )}
        {order.payStatus === "PAID" && ["PLACED", "ACCEPTED", "PREPARING"].includes(order.status) && (
          <BigButton variant="danger" onClick={refund}>{t("refund")}</BigButton>
        )}
        <a
          href={waBuyer}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--leaf)] px-6 text-lg font-bold text-white"
        >
          {t("callBuyer")}
        </a>
        <button type="button" onClick={() => router.push("/app/orders")} className="min-h-[56px] text-base font-bold underline" style={{ color: "var(--indigo)" }}>
          {t("title")}
        </button>
      </div>
    </main>
  );
}
