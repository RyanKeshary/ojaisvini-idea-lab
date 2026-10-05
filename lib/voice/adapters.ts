import { speechCodes, type Locale } from "@/lib/i18n/config";

/** Adapter interfaces — real providers (Bhashini/Sarvam/Google) swap in later. */
export interface Transcript {
  text: string;
  confidence: number;
  final: boolean;
}

export interface SpeechToText {
  readonly supported: boolean;
  start(locale: Locale, onResult: (t: Transcript) => void, onError?: (e: string) => void): void;
  stop(): void;
}

export interface PlaybackHandle {
  stop(): void;
}

export interface TextToSpeech {
  readonly supported: boolean;
  speak(text: string, locale: Locale, rate?: number): Promise<PlaybackHandle>;
  stop(): void;
}

/** Web Speech API STT with graceful fallback. */
class WebSpeechSTT implements SpeechToText {
  private rec: unknown = null;
  get supported(): boolean {
    return (
      typeof window !== "undefined" &&
      (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window))
    );
  }
  start(locale: Locale, onResult: (t: Transcript) => void, onError?: (e: string) => void): void {
    if (!this.supported) {
      onError?.("stt-unsupported");
      return;
    }
    const Ctor =
      (window as unknown as Record<string, new () => WebSpeechRecognizer>).SpeechRecognition ??
      (window as unknown as Record<string, new () => WebSpeechRecognizer>).webkitSpeechRecognition;
    const rec = new Ctor();
    rec.lang = speechCodes[locale];
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev: WebSpeechResultEvent) => {
      const r = ev.results[ev.results.length - 1]?.[0];
      if (r) onResult({ text: r.transcript, confidence: r.confidence || 0.8, final: ev.results[ev.results.length - 1].isFinal });
    };
    rec.onerror = (ev: { error?: string }) => onError?.(ev.error ?? "stt-error");
    this.rec = rec;
    rec.start();
  }
  stop(): void {
    (this.rec as { stop?: () => void } | null)?.stop?.();
    this.rec = null;
  }
}

interface WebSpeechRecognizer {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: WebSpeechResultEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  start(): void;
  stop(): void;
}
interface WebSpeechResultEvent {
  results: ArrayLike<{ isFinal: boolean } & ArrayLike<{ transcript: string; confidence: number }>>;
}

/** Mock STT used offline / when mic unavailable — caller shows tap-to-choose fallbacks. */
class MockSTT implements SpeechToText {
  readonly supported = false;
  start(_l: Locale, _cb: (t: Transcript) => void, onError?: (e: string) => void): void {
    onError?.("stt-unsupported");
  }
  stop(): void {}
}

/** Web Speech Synthesis TTS with per-locale voice picking + audio level envelope hook. */
class WebSpeechTTS implements TextToSpeech {
  get supported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }
  speak(text: string, locale: Locale, rate = 1): Promise<PlaybackHandle> {
    return new Promise((resolve) => {
      if (!this.supported) return resolve({ stop: () => {} });
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechCodes[locale];
      u.rate = Math.min(1.25, Math.max(0.75, rate));
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find((x) => x.lang?.startsWith(speechCodes[locale].slice(0, 2)));
      if (v) u.voice = v;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      resolve({ stop: () => window.speechSynthesis.cancel() });
    });
  }
  stop(): void {
    if (this.supported) window.speechSynthesis.cancel();
  }
}

export function getSTT(): SpeechToText {
  const web = new WebSpeechSTT();
  return web.supported ? web : new MockSTT();
}

export function getTTS(): TextToSpeech {
  return new WebSpeechTTS();
}
