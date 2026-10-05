"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { Check } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";

type Detail = {
  id: string;
  name: string;
  nameI18n: Record<string, string>;
  level: string;
  states: string[];
  categories: string[];
  benefits: Record<string, string>;
  documents: string[];
  applyUrl: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
};

/** Full scheme detail: localized info, tickable documents, official link. */
export default function SchemeDetailPage() {
  const t = useTranslations("schemes");
  const te = useTranslations("auth.errors");
  const params = useParams<{ id: string }>();
  const { locale } = usePrefs();
  const [scheme, setScheme] = useState<Detail | null>(null);
  const [saved, setSaved] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/schemes/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setScheme(j.scheme);
          setSaved(j.saved);
          setChecks(j.checklist);
        } else setError(te("somethingWrong"));
      })
      .catch(() => setError(te("somethingWrong")));
  }, [params.id, te]);

  async function toggleDoc(doc: string) {
    const next = { ...checks, [doc]: !checks[doc] };
    setChecks(next);
    try {
      await fetch("/api/schemes/saved", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemeId: params.id, save: true, checklist: { [doc]: next[doc] } }),
      });
    } catch {}
  }

  if (!scheme) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-3 py-6" aria-label={t("title")}>
        <div className="skeleton h-24 rounded-[20px]" />
        <div className="skeleton h-48 rounded-[20px]" />
      </main>
    );
  }

  const loc = (locale === "mr" || locale === "en" ? locale : "hi") as "hi" | "mr" | "en";
  const name = scheme.nameI18n[loc] && scheme.nameI18n[loc] !== scheme.name ? `${scheme.nameI18n[loc]} · ${scheme.name}` : scheme.name;
  const benefit = scheme.benefits[loc] || scheme.benefits.en || "";
  const doneCount = scheme.documents.filter((d) => checks[d]).length;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-3xl font-bold">{name}</h1>
      <p className="text-lg opacity-80">{benefit}</p>
      <ListenButton text={`${name}. ${benefit}`} />
      <AuthError message={error} />
      <section aria-label={t("documents")} className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-lg font-bold">{t("documents")} ({doneCount}/{scheme.documents.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {scheme.documents.map((d) => (
            <li key={d}>
              <button
                type="button"
                onClick={() => void toggleDoc(d)}
                aria-pressed={!!checks[d]}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-[12px] border-2 px-3 text-left text-base"
                style={{ borderColor: checks[d] ? "var(--leaf)" : "var(--border)" }}
              >
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: checks[d] ? "var(--leaf)" : "var(--border)", background: checks[d] ? "var(--leaf)" : "transparent", color: "#fff" }}>
                  {checks[d] ? <Check size={16} /> : null}
                </span>
                {d}
              </button>
            </li>
          ))}
        </ul>
      </section>
      {scheme.applyUrl && (
        <a
          href={scheme.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]"
        >
          {t("applyHere")} ↗
        </a>
      )}
      <p className="rounded-[12px] bg-[var(--clay-soft)] p-3 text-sm">
        {t("verifyNote")}
        {scheme.lastVerifiedAt && (
          <span className="opacity-70"> {t("verifiedOn")}: {new Date(scheme.lastVerifiedAt).toISOString().slice(0, 10)}.</span>
        )}
      </p>
      {saved && <p className="text-base font-bold">★ {t("saved")}</p>}
    </main>
  );
}
