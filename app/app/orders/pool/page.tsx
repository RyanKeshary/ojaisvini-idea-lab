"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { AuthError } from "@/components/auth/AuthError";
import { inr } from "@/lib/utils";

type Batch = {
  id: string;
  pincode: string;
  status: string;
  savedPaise: number;
  deliveries: Array<{ order: { id: string; status: string; total: number; buyerName: string } }>;
};

/** Village pooling: build a shared pickup batch, mark collected. */
export default function PoolPage() {
  const t = useTranslations("orders");
  const ts = useTranslations("shop");
  const te = useTranslations("auth.errors");
  const [pincode, setPincode] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pin: string) {
    try {
      const r = await fetch(`/api/delivery/batches${pin ? `?pincode=${pin}` : ""}`).then((x) => x.json());
      if (r.ok) setBatches(r.batches);
    } catch {}
  }

  useEffect(() => {
    void load("");
  }, []);

  async function build() {
    setError(null);
    if (!/^\d{6}$/.test(pincode)) {
      setError(te("invalidPhone"));
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/delivery/batches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pincode }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      await load(pincode);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function collect(batchId: string) {
    setBusy(true);
    try {
      await fetch("/api/delivery/batches", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ batchId }),
      });
      await load(pincode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("poolTitle")}</h1>
      <p className="text-base opacity-75">{t("poolHint")}</p>
      <AuthError message={error} />
      <label className="flex flex-col gap-1 text-base font-bold">
        {ts("pincode")}
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="411001"
          className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-lg"
          style={{ borderColor: "var(--border)" }}
        />
      </label>
      <BigButton onClick={build} state={busy ? "loading" : "idle"}>{t("poolBuild")}</BigButton>
      <ul className="flex flex-col gap-3">
        {batches.map((b) => (
          <li key={b.id} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{b.pincode} · {b.deliveries.length} orders</p>
              <StatusPill status={b.status} />
            </div>
            <p className="mt-1 text-sm font-bold" style={{ color: "var(--leaf)" }}>
              {t("poolSaved")}: {inr((b.savedPaise / 100) * Math.max(1, b.deliveries.length))}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {b.deliveries.map((d) => (
                <li key={d.order.id} className="text-sm">
                  {d.order.buyerName} · {inr(d.order.total)} · {d.order.status.replaceAll("_", " ").toLowerCase()}
                </li>
              ))}
            </ul>
            {b.status !== "COLLECTED" && (
              <button
                type="button"
                onClick={() => void collect(b.id)}
                className="mt-3 min-h-[56px] w-full rounded-[12px] border-2 text-base font-bold"
                style={{ borderColor: "var(--turmeric)" }}
              >
                {t("markCollected")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
