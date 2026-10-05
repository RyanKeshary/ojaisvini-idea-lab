"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { canInstall, isIosSafari, isStandalone, onInstallReady, promptInstall } from "@/lib/pwa/install";

const DISMISSED_KEY = "ojas-install-dismissed";

/**
 * Voiced "keep Ojasvini on your phone" card. Shows after first listing
 * when installable (or iOS manual steps), never when already installed.
 */
export function InstallCard() {
  const t = useTranslations("pwa");
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(canInstall() || isIosSafari());
    return onInstallReady(() => setReady(true));
  }, []);

  if (isStandalone() || dismissed || !ready) return null;

  async function install() {
    const ok = await promptInstall();
    if (ok || isIosSafari()) {
      try {
        localStorage.setItem(DISMISSED_KEY, "1");
      } catch {}
      setDismissed(true);
    }
  }

  return (
    <section className="rounded-[20px] border-2 bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }} aria-label={t("title")}>
      <h2 className="display text-xl font-bold">📲 {t("title")}</h2>
      <p className="mt-1 text-base opacity-80">{isIosSafari() ? t("iosSteps") : t("body")}</p>
      <div className="mt-3 flex gap-2">
        {!isIosSafari() && (
          <button type="button" onClick={install} className="min-h-[56px] flex-1 rounded-[12px] bg-[var(--turmeric)] text-base font-bold text-[var(--primary-ink)]">
            {t("install")}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(DISMISSED_KEY, "1");
            } catch {}
            setDismissed(true);
          }}
          className="min-h-[56px] rounded-[12px] border-2 px-4 text-base font-bold"
          style={{ borderColor: "var(--border)" }}
        >
          {t("later")}
        </button>
      </div>
    </section>
  );
}
