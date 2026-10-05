"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { AuthError } from "@/components/auth/AuthError";
import { inr } from "@/lib/utils";

type Tab = "overview" | "users" | "products" | "reports" | "ai" | "flags" | "schemes";

/** Admin console: metrics, users, moderation, AI usage, flags, schemes. */
export default function AdminPage() {
  const t = useTranslations("admin");
  const te = useTranslations("auth.errors");
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  async function fetchTab(tb: Tab, query = "") {
    setError(null);
    try {
      const url =
        tb === "overview" ? "/api/admin/overview"
        : tb === "users" ? `/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ""}`
        : tb === "products" ? "/api/admin/products"
        : tb === "reports" ? "/api/admin/reports"
        : tb === "ai" ? "/api/admin/ai-usage"
        : tb === "flags" ? "/api/admin/flags"
        : "/api/schemes?showAll=1";
      const r = await fetch(url).then((x) => x.json());
      if (!r.ok && r.code) throw new Error(r.code);
      setData(r);
    } catch {
      setError(te("somethingWrong"));
    }
  }

  useEffect(() => {
    void fetchTab(tab, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function act(url: string, body: unknown) {
    setBusy(true);
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      await fetchTab(tab, q);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  const tabs: Tab[] = ["overview", "users", "products", "reports", "ai", "flags", "schemes"];
  const btn = "min-h-[56px] shrink-0 rounded-full border-2 px-4 text-sm font-bold";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pb-16 pt-6">
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <AuthError message={error} />
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t("title")}>
        {tabs.map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => setTab(tb)}
            className={btn}
            style={{ borderColor: tab === tb ? "var(--turmeric)" : "var(--border)" }}
          >
            {t(`tabs.${tb}`)}
          </button>
        ))}
      </div>

      {tab === "overview" && data && (
        <OverviewView metrics={(data as { metrics: Metrics }).metrics} />
      )}
      {tab === "users" && (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void fetchTab("users", q);
            }}
            placeholder={t("search")}
            aria-label={t("search")}
            className="min-h-[56px] rounded-[12px] border-2 bg-transparent px-4 text-base"
            style={{ borderColor: "var(--border)" }}
          />
          <ul className="flex flex-col gap-2">
            {((data as { users?: UserRow[] } | null)?.users || []).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="font-bold">{u.name || u.phone}</p>
                  <p className="text-xs opacity-70">{u.phone} · {u.role} · {u.locale}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => void act("/api/admin/users", { userId: u.id, role: e.target.value })}
                  aria-label={`Role for ${u.name || u.phone}`}
                  className="min-h-[48px] rounded-[8px] border bg-transparent px-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  {["WOMAN", "SAKHI", "MENTOR", "ADMIN"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </>
      )}
      {tab === "products" && (
        <ul className="flex flex-col gap-2">
          {((data as { products?: ProdRow[] } | null)?.products || []).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="font-bold">{p.title} · {inr(p.price)}</p>
                <p className="text-xs opacity-70">{p.shop} · {p.status}</p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("/api/admin/products", { id: p.id, status: p.status === "LIVE" ? "PAUSED" : "LIVE" })}
                className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: "var(--turmeric)" }}
              >
                {p.status === "LIVE" ? t("pause") : t("restore")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {tab === "reports" && (
        <ReportsView
          data={(data as { reports?: ReportRow[]; flagged?: FlagRow[] } | null) || null}
          act={act}
          t={t}
        />
      )}
      {tab === "ai" && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-bold">{t("aiTotal")}: {(data as { total?: number } | null)?.total ?? 0}</p>
          {((data as { byFeature?: AiRow[] } | null)?.byFeature || []).map((f) => (
            <div key={f.feature} className="rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="font-bold">{f.feature}</p>
              <p className="text-sm opacity-70">
                {f.calls} calls · {f.avgMs}ms avg · {f.prompt + f.completion} tokens{f.degraded ? ` · ${f.degraded} degraded` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
      {tab === "flags" && (
        <FlagsView flags={((data as { flags?: Flag[] } | null)?.flags || [])} act={act} />
      )}
      {tab === "schemes" && (
        <p className="text-base opacity-75">
          {((data as { schemes?: unknown[] } | null)?.schemes || []).length} schemes · {t("schemesNote")}
        </p>
      )}
    </main>
  );
}

type Metrics = {
  women: number; shops: number; liveProducts: number; paidOrders: number; gmv: number;
  medianFirstSaleDays: number | null; schemes: number; lessonsDone: number; posts: number;
  openReports: number; byLocale: Array<{ locale: string; count: number }>;
};
type UserRow = { id: string; phone: string; name: string; role: string; locale: string };
type ProdRow = { id: string; title: string; price: number; status: string; shop: string };
type ReportRow = { id: string; targetType: string; targetId: string; reason: string };
type FlagRow = { id: string; text: string; status: string; author: string };
type AiRow = { feature: string; calls: number; avgMs: number; prompt: number; completion: number; degraded: number };
type Flag = { key: string; value: string };

function OverviewView({ metrics: m }: { metrics: Metrics }) {
  const cards: Array<[string, string]> = [
    ["Women", String(m.women)],
    ["Shops", String(m.shops)],
    ["Live products", String(m.liveProducts)],
    ["Paid orders", String(m.paidOrders)],
    ["GMV", inr(m.gmv)],
    ["Median first sale", m.medianFirstSaleDays === null ? "—" : `${m.medianFirstSaleDays}d`],
    ["Schemes", String(m.schemes)],
    ["Lessons done", String(m.lessonsDone)],
    ["Posts", String(m.posts)],
    ["Open reports", String(m.openReports)],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {cards.map(([k, v]) => (
        <div key={k} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
          <p className="display text-2xl font-bold">{v}</p>
          <p className="text-sm opacity-70">{k}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-[20px] border bg-[var(--card)] p-4 md:col-span-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm opacity-70">Languages</p>
        <p className="font-bold">{m.byLocale.map((b) => `${b.locale}: ${b.count}`).join(" · ")}</p>
      </div>
    </div>
  );
}

function ReportsView({ data, act, t }: { data: { reports?: ReportRow[]; flagged?: FlagRow[] } | null; act: (u: string, b: unknown) => void; t: (k: string) => string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{t("reports")} ({(data?.reports || []).length})</h2>
      {(data?.reports || []).map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-2 rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm">{r.targetType}:{r.targetId.slice(0, 8)} · {r.reason || "—"}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => act("/api/admin/reports", { reportId: r.id, action: "dismiss" })} className="min-h-[48px] rounded-full border px-3 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
              {t("dismiss")}
            </button>
            <button type="button" onClick={() => act("/api/admin/reports", { reportId: r.id, action: "hide" })} className="min-h-[48px] rounded-full bg-[var(--madder)] px-3 text-sm font-bold text-white">
              {t("hide")}
            </button>
          </div>
        </div>
      ))}
      <h2 className="text-lg font-bold">{t("flagged")}</h2>
      {(data?.flagged || []).map((f) => (
        <p key={f.id} className="rounded-[12px] border p-3 text-sm" style={{ borderColor: "var(--border)" }}>
          {f.text} — {f.author} [{f.status}]
        </p>
      ))}
    </div>
  );
}

function FlagsView({ flags, act }: { flags: Flag[]; act: (u: string, b: unknown) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {(flags.length ? flags : [{ key: "assistant_enabled", value: "1" }]).map((f) => (
        <div key={f.key} className="flex items-center justify-between gap-2 rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
          <p className="font-mono text-sm font-bold">{f.key}</p>
          <button
            type="button"
            onClick={() => act("/api/admin/flags", { key: f.key, value: f.value === "0" ? "1" : "0" })}
            aria-pressed={f.value !== "0"}
            className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold"
            style={{ borderColor: f.value !== "0" ? "var(--leaf)" : "var(--mist)" }}
          >
            {f.value !== "0" ? "ON" : "OFF"}
          </button>
        </div>
      ))}
      <AddFlag act={act} />
    </div>
  );
}

function AddFlag({ act }: { act: (u: string, b: unknown) => void }) {
  const [key, setKey] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={key}
        onChange={(e) => setKey(e.target.value.replace(/[^a-z0-9_]/g, "").slice(0, 40))}
        placeholder="new_flag"
        aria-label="New flag key"
        className="min-h-[56px] min-w-0 flex-1 rounded-[12px] border-2 bg-transparent px-3 font-mono text-sm"
        style={{ borderColor: "var(--border)" }}
      />
      <BigButton variant="secondary" onClick={() => {
        if (key) {
          void act("/api/admin/flags", { key, value: "1" });
          setKey("");
        }
      }}>
        Add
      </BigButton>
    </div>
  );
}
