"use client";

/**
 * Whisper STT fallback (Phase 1). Used ONLY when Web Speech STT is
 * unavailable (Firefox/iOS quirks). Records a short snippet, POSTs to
 * /api/stt, returns the transcript. Typed input remains the final fallback.
 */

export function canRecord(): boolean {
  return typeof window !== "undefined" && typeof MediaRecorder !== "undefined";
}

/** Record up to maxMs (default 10s; hard cap 30s per spec). Resolves early via stop(). */
export function recordSnippet(maxMs = 10000): { promise: Promise<Blob>; stop: () => void } {
  let stopFn = () => {};
  const promise = (async (): Promise<Blob> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    try {
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      const done = new Promise<Blob>((resolve, reject) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        rec.onerror = () => reject(new Error("record-failed"));
        stopFn = () => {
          if (rec.state !== "inactive") rec.stop();
        };
      });
      rec.start();
      const timer = setTimeout(() => stopFn(), Math.min(30000, Math.max(3000, maxMs)));
      const blob = await done;
      clearTimeout(timer);
      return blob;
    } finally {
      stream.getTracks().forEach((t) => t.stop());
    }
  })();
  return { promise, stop: () => stopFn() };
}

export async function remoteTranscribe(blob: Blob, lang: string): Promise<string> {
  const form = new FormData();
  form.append("audio", blob, "snippet.webm");
  form.append("lang", lang.slice(0, 2));
  const r = await fetch("/api/stt", { method: "POST", body: form });
  const j = (await r.json()) as { ok?: boolean; text?: string; code?: string };
  if (!r.ok || !j.text) throw new Error(j.code || "stt-failed");
  return j.text;
}
