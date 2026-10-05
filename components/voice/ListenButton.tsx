"use client";
import { useState } from "react";
import { Volume2, Square } from "lucide-react";
import { getTTS } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";
import { speechCodes } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

/** Persistent per-screen Listen button: reads `text` aloud in her language. */
export function ListenButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const t = useTranslations("common");
  const { locale, voiceSpeed } = usePrefs();
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const tts = getTTS();
    if (playing) {
      tts.stop();
      setPlaying(false);
      return;
    }
    if (!tts.supported) return;
    setPlaying(true);
    try {
      const h = await tts.speak(text, locale, voiceSpeed);
      void h;
      // SpeechSynthesis has no reliable onend across browsers here; reset on toggle.
    } finally {
      // keep playing state until user stops (barge-in via tap)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${t("listen")} (${speechCodes[locale]})`}
      aria-pressed={playing}
      className={
        "inline-flex min-h-[56px] items-center gap-2 rounded-full border px-5 text-base font-semibold " +
        "border-[var(--border)] bg-[var(--card)] text-[var(--fg)] active:scale-[0.97] transition-transform"
      }
    >
      {playing ? <Square size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />}
      {!compact && <span>{t("listen")}</span>}
    </button>
  );
}
