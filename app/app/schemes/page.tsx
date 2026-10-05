"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SchemeCard, type SchemeListItem } from "@/components/schemes/SchemeCard";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { StepDots } from "@/components/ui/StepDots";
import { usePrefs } from "@/lib/store/prefs";

type Profile = {
  state: string;
  age: number | null;
  business: string;
  incomeAnnual: number | null;
  shg: "yes" | "no" | "unknown";
  caste: string;
};

const STATES = [
  { code: "MH", icon: "📍", label: "Maharashtra" },
  { code: "GJ", icon: "📍", label: "Gujarat" },
  { code: "TN", icon: "📍", label: "Tamil Nadu" },
  { code: "OTHER", icon: "📍", label: "Other" },
];
const AGES = [
  { v: 25, icon: "🧒", label: "18–30" },
  { v: 38, icon: "🧑", label: "31–45" },
  { v: 53, icon: "🧓", label: "46–60" },
  { v: 65, icon: "👵", label: "60+" },
];
const BUSINESSES = [
  { v: "food", icon: "🥘" },
  { v: "tailoring", icon: "🧵" },
  { v: "handicraft", icon: "🎨" },
  { v: "farm", icon: "🌾" },
  { v: "service", icon: "💇" },
  { v: "vendor", icon: "🧺" },
];
const INCOMES = [
  { v: 80000, label: 0 },
  { v: 200000, label: 1 },
  { v: 500000, label: 2 },
  { v: -1, label: 3 },
];
const CATS = ["All", "loan", "subsidy", "training", "insurance", "market", "savings", "account"];

/** Scheme Finder: match-me wizard + ranked eligible-only list. */
export default function SchemesPage() {
  const t = useTranslations("schemes");
  const te = useTranslations("auth.errors");
  const { locale } = usePrefs();
  const [profile, setProfile] = useState<Profile>({ state: "MH", age: null, business: "any", incomeAnnual: null, shg: "unknown", caste: "unknown" });
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (p: Profile, category: string, all: boolean) => {
      setError(null);
      try {
        const q = new URLSearchParams({
          state: p.state,
          business: p.business,
          gender: "women",
          shg: p.shg,
          caste: p.caste,
          showAll: all ? "1" : "0",
          locale,
          ...(p.age !== null ? { age: String(p.age) } : {}),
          ...(p.incomeAnnual !== null ? { incomeAnnual: String(p.incomeAnnual) } : {}),
          ...(category !== "All" ? { category: category.toLowerCase() } : {}),
        });
        const r = await fetch(`/api/schemes?${q}`).then((x) => x.json());
        if (r.ok) setSchemes(r.schemes);
        else setError(te("somethingWrong"));
      } catch {
        setError(te("somethingWrong"));
      }
    },
    [locale, te]
  );

  useEffect(() => {
    void search(profile, cat, showAll);
    fetch("/api/schemes/saved")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSavedIds(new Set(j.saved.map((s: { schemeId: string }) => s.schemeId)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(id: string, want: boolean) {
    try {
      const r = await fetch("/api/schemes/saved", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemeId: id, save: want }),
      }).then((x) => x.json());
      if (r.ok) {
        setSavedIds((s) => {
          const n = new Set(s);
          if (want) n.add(id);
          else n.delete(id);
          return n;
        });
      }
    } catch {}
  }

  const tile = (selected: boolean) =>
    `flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-[12px] border-2 px-2 py-2 text-center`;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <p className="text-base opacity-75">{t("subtitle")}</p>
      <AuthError message={error} />

      {!wizard ? (
        <button
          type="button"
          onClick={() => {
            setWizard(true);
            setStep(0);
          }}
          className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]"
        >
          {t("matchMe")}
        </button>
      ) : (
        <section className="rounded-[20px] border-2 bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }} aria-label={t("wizardTitle")}>
          <StepDots total={5} current={step} />
          {step === 0 && (
            <>
              <p className="mt-2 text-lg font-bold">{t("qState")}</p>
              <ListenButton text={t("qState")} compact />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {STATES.map((s) => (
                  <button key={s.code} type="button" onClick={() => { setProfile((p) => ({ ...p, state: s.code })); setStep(1); }} className={tile(false)} style={{ borderColor: "var(--border)" }}>
                    <span aria-hidden className="text-2xl">{s.icon}</span>
                    <span className="text-sm font-bold">{s.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="mt-2 text-lg font-bold">{t("qAge")}</p>
              <ListenButton text={t("qAge")} compact />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {AGES.map((a) => (
                  <button key={a.v} type="button" onClick={() => { setProfile((p) => ({ ...p, age: a.v })); setStep(2); }} className={tile(false)} style={{ borderColor: "var(--border)" }}>
                    <span aria-hidden className="text-2xl">{a.icon}</span>
                    <span className="text-sm font-bold">{a.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="mt-2 text-lg font-bold">{t("qBusiness")}</p>
              <ListenButton text={t("qBusiness")} compact />
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BUSINESSES.map((b) => (
                  <button key={b.v} type="button" onClick={() => { setProfile((p) => ({ ...p, business: b.v })); setStep(3); }} className={tile(false)} style={{ borderColor: "var(--border)" }}>
                    <span aria-hidden className="text-2xl">{b.icon}</span>
                    <span className="text-xs font-bold">{(t.raw("businesses") as string[])[BUSINESSES.indexOf(b)]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="mt-2 text-lg font-bold">{t("qIncome")}</p>
              <ListenButton text={t("qIncome")} compact />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {INCOMES.map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => {
                      const p = { ...profile, incomeAnnual: o.v < 0 ? null : o.v };
                      setProfile(p);
                      setStep(4);
                    }}
                    className={tile(false)}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-sm font-bold">{(t.raw("incomeBands") as string[])[o.label]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p className="mt-2 text-lg font-bold">{t("qShg")}</p>
              <ListenButton text={t("qShg")} compact />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={async () => {
                      const p = { ...profile, shg: v };
                      setProfile(p);
                      setWizard(false);
                      await search(p, cat, showAll);
                    }}
                    className={tile(false)}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-sm font-bold">{v === "yes" ? t("optShgYes") : t("optShgNo")}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filters">
        {CATS.map((c, i) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => {
              setCat(c);
              void search(profile, c, showAll);
            }}
            className="min-h-[48px] shrink-0 rounded-full border-2 px-4 text-sm font-bold"
            style={{ borderColor: cat === c ? "var(--turmeric)" : "var(--border)" }}
          >
            {(t.raw("filters") as string[])[i]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          const v = !showAll;
          setShowAll(v);
          void search(profile, cat, v);
        }}
        aria-pressed={showAll}
        className="min-h-[48px] self-start text-sm font-bold underline"
        style={{ color: "var(--indigo)" }}
      >
        {showAll ? t("hideOthers") : t("showOthers")}
      </button>

      <div className="flex flex-col gap-3">
        {schemes.map((s) => (
          <SchemeCard key={s.id} item={s} saved={savedIds.has(s.id)} onSave={save} />
        ))}
      </div>
      <p className="rounded-[12px] bg-[var(--clay-soft)] p-3 text-sm font-bold">{t("verifyNote")}</p>
    </main>
  );
}
