"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mic, Square } from "lucide-react";

/**
 * 60s voice-note recorder. Returns the uploaded URL via onReady.
 * Playback included; re-record replaces.
 */
export function AudioNote({ onReady }: { onReady: (url: string | null) => void }) {
  const t = useTranslations("community");
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((x) => x.stop());
        setRecording(false);
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        setBusy(true);
        try {
          const form = new FormData();
          form.append("photo", blob, "note.webm");
          const r = await fetch("/api/upload", { method: "POST", body: form });
          const j = (await r.json()) as { ok?: boolean; url?: string };
          if (r.ok && j.url) {
            setUrl(j.url);
            onReady(j.url);
          }
        } finally {
          setBusy(false);
        }
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, 60000);
    } catch {
      setRecording(false);
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("audioOpt")}>
      {!recording && !url && (
        <button type="button" onClick={start} className="flex min-h-[56px] items-center gap-2 rounded-[12px] border-2 px-4 text-base font-bold" style={{ borderColor: "var(--border)" }}>
          <Mic size={18} aria-hidden /> {t("record")}
        </button>
      )}
      {recording && (
        <button type="button" onClick={stop} className="flex min-h-[56px] items-center gap-2 rounded-[12px] px-4 text-base font-bold text-white" style={{ background: "var(--madder)" }} aria-label={t("stop")}>
          <Square size={18} aria-hidden /> ● ● ●
        </button>
      )}
      {busy && <span className="text-sm opacity-70">…</span>}
      {url && !recording && (
        <span className="flex items-center gap-2">
          <audio src={url} controls preload="none" className="h-10 max-w-[200px]" aria-label="Voice note preview" />
          <button
            type="button"
            onClick={() => {
              setUrl(null);
              onReady(null);
            }}
            className="min-h-[48px] text-sm font-bold underline"
            style={{ color: "var(--indigo)" }}
          >
            {t("record")}
          </button>
        </span>
      )}
    </div>
  );
}
