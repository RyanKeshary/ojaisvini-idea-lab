"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ListenButton } from "@/components/voice/ListenButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { inr } from "@/lib/utils";

type Note = {
  id: string;
  kind: string;
  payload: { orderId?: string; total?: number; net?: number; items?: number; buyer?: string };
  read: boolean;
  createdAt: string;
};

function describe(n: Note): string {
  if (n.kind === "new-order") {
    return `🧺 New order ${inr(n.payload.total || 0)}${n.payload.buyer ? ` — ${n.payload.buyer}` : ""}`;
  }
  if (n.kind === "payout-ready") {
    return `💰 Payout ready: ${inr(n.payload.net || 0)}`;
  }
  return `• ${n.kind}`;
}

/** In-app inbox with spoken summary. Web Push needs prod VAPID infra (deferred). */
export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const [items, setItems] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const r = await fetch("/api/notifications").then((x) => x.json());
      if (r.ok) {
        setItems(r.notifications);
        setUnread(r.unread);
      }
    } catch {}
  }

  useEffect(() => {
    void load();
  }, []);

  async function markAll() {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await load();
    } catch {}
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl font-bold">{t("title")}</h1>
        {unread > 0 && (
          <button type="button" onClick={markAll} className="min-h-[48px] text-sm font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("markAll")} ({unread})
          </button>
        )}
      </div>
      <ListenButton text={items.map(describe).join(". ") || t("empty")} />
      {items.length === 0 ? (
        <EmptyState icon="🔔" title={t("empty")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: n.read ? "var(--border)" : "var(--turmeric)" }}>
              <p className="text-base">{describe(n)}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs opacity-60">{new Date(n.createdAt).toLocaleDateString()}</span>
                {n.payload.orderId && (
                  <Link href={`/app/orders/${n.payload.orderId}`} className="text-sm font-bold underline" style={{ color: "var(--indigo)" }}>
                    {t("view")}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
