"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mic, Camera, Minus, Plus, Check } from "lucide-react";
import QRCode from "qrcode";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { ListenButton } from "@/components/voice/ListenButton";
import { BigButton } from "@/components/ui/BigButton";
import { StepDots } from "@/components/ui/StepDots";
import { PriceTag } from "@/components/ui/PriceTag";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { AuthError } from "@/components/auth/AuthError";
import type { ListingDraft } from "@/lib/ai/schema";
import { getSTT, getTTS } from "@/lib/voice/adapters";
import { canRecord, recordSnippet, remoteTranscribe } from "@/lib/voice/remote-stt";
import { usePrefs } from "@/lib/store/prefs";
import { compressPhoto, luminance, uploadPhoto } from "@/lib/photos/client";
import { queueWrite } from "@/lib/offline/sync";
import { saveCreateDraft, loadCreateDraft, clearCreateDraft } from "@/lib/offline/drafts";
import { InstallCard } from "@/components/pwa/InstallCard";
import { toast } from "@/components/ui/Toast";
import { inr } from "@/lib/utils";

type Photo = { preview: string; url?: string; dark?: boolean; uploading?: boolean; blob?: Blob };

const DRAFT_KEY = "ojas-draft";

export default function CreatePage() {
  const t = useTranslations("create");
  const tp = useTranslations("pwa");
  const te = useTranslations("auth.errors");
  const { locale } = usePrefs();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [spoken, setSpoken] = useState("");
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [mocked, setMocked] = useState(true);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery" | "both">("both");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cmdListening, setCmdListening] = useState(false);
  const [published, setPublished] = useState<{ shopSlug: string; shopName: string } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sttRef = useRef<ReturnType<typeof getSTT> | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Restore an interrupted draft (offline-safe local copy).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { spoken?: string; step?: number };
        if (d.spoken) {
          setSpoken(d.spoken);
          setHeard(d.spoken);
        }
      }
    } catch {}
    // Offline-tolerant IDB draft (raw transcript + photo blobs, survives reload).
    void (async () => {
      const saved = await loadCreateDraft();
      if (saved && !heard) {
        setSpoken(saved.transcript);
        setHeard(saved.transcript);
        // Resume at the photo step (AI draft state is never persisted).
        if (saved.photos.length > 0) setStep(1);
        const restored: Photo[] = saved.photos.map((blob) => ({ preview: URL.createObjectURL(blob), uploading: true, blob }));
        setPhotos(restored);
        if (navigator.onLine) {
          for (const ph of restored) {
            try {
              const lum = await luminance(ph.blob!);
              const url = await uploadPhoto(ph.blob!);
              setPhotos((p) => p.map((x) => (x.preview === ph.preview ? { preview: ph.preview, url, dark: lum < 0.28, blob: ph.blob } : x)));
            } catch {
              setPhotos((p) => p.filter((x) => x.preview !== ph.preview));
            }
          }
        } else {
          // Still offline: mark pending (no spinner), draft stays restorable.
          setPhotos((p) => p.map((x) => ({ ...x, uploading: false })));
        }
        toast(tp("draftSaved"));
      }
    })();
    return () => {
      sttRef.current?.stop();
      recRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ spoken: heard || spoken, step }));
    } catch {}
  }, [heard, spoken, step]);

  function listen(target: "name" | "command") {
    // Tap-again stops an in-progress Whisper recording.
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const stt = getSTT();
    sttRef.current = stt;
    if (!stt.supported) {
      // Fallback chain: Web Speech -> Whisper record -> typed input.
      if (!canRecord()) {
        setError(te("somethingWrong"));
        return;
      }
      if (target === "name") setListening(true);
      else setCmdListening(true);
      setRecording(true);
      const rec = recordSnippet(10000);
      recRef.current = rec;
      const finish = () => {
        setListening(false);
        setCmdListening(false);
        setRecording(false);
        recRef.current = null;
      };
      rec.promise
        .then(async (blob) => {
          finish();
          try {
            const text = await remoteTranscribe(blob, locale);
            if (target === "name") setHeard(text);
            else await handleCommand(text);
          } catch {
            setError(te("somethingWrong"));
          }
        })
        .catch(() => {
          finish();
          setError(te("somethingWrong"));
        });
      return;
    }
    if (target === "name") setListening(true);
    else setCmdListening(true);
    stt.start(
      locale,
      (tr) => {
        if (!tr.final) return;
        stt.stop();
        if (target === "name") {
          setListening(false);
          if (tr.confidence < 0.5) {
            setError(te("somethingWrong"));
            return;
          }
          setHeard(tr.text);
        } else {
          setCmdListening(false);
          handleCommand(tr.text);
        }
      },
      () => {
        setListening(false);
        setCmdListening(false);
        setError(te("somethingWrong"));
      }
    );
  }

  /** Review commands go through /api/ai/intent (rule-first, Groq fallback). */
  async function handleCommand(text: string) {
    setError(null);
    try {
      const r = await fetch("/api/ai/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = (await r.json()) as { ok?: boolean; intent?: string; value?: number | string };
      if (!r.ok || !j.ok) throw new Error("intent-failed");
      switch (j.intent) {
        case "set_price": {
          const p = Number(j.value);
          if (Number.isFinite(p) && p > 0) {
            setPrice(Math.round(p));
            await speak(`${t("price")}: ${inr(Math.round(p))}`);
          }
          break;
        }
        case "set_stock": {
          const s = Number(j.value);
          if (Number.isFinite(s) && s > 0) setStock(Math.min(100000, Math.round(s)));
          break;
        }
        case "confirm":
          await publish();
          break;
        case "reject":
          setStep(0);
          setHeard("");
          break;
        case "rename":
          titleRef.current?.focus();
          break;
        case "navigate": {
          const dest = String(j.value || "").toLowerCase();
          if (dest.includes("order")) router.push("/app/orders");
          else if (dest.includes("home")) router.push("/app/home");
          else if (dest.includes("shop") || dest.includes("product")) router.push("/app/products");
          break;
        }
        case "help":
          await readDraft();
          break;
        default:
          setError(te("somethingWrong"));
      }
    } catch {
      setError(te("somethingWrong"));
    }
  }

  async function speak(text: string) {
    const tts = getTTS();
    if (tts.supported) await tts.speak(text, locale, 1);
  }

  async function readDraft() {
    if (!draft) return;
    await speak(`${draft.title}. ${draft.description}. ${t("price")}: ${inr(price)}`);
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const room = 4 - photos.length;
    const batch = [...files].slice(0, room);
    for (const f of batch) {
      const preview = URL.createObjectURL(f);
      setPhotos((p) => [...p, { preview, uploading: true }]);
      try {
        const blob = await compressPhoto(f);
        const lum = await luminance(blob);
        // Best-effort upload: offline keeps the blob locally for later.
        let url: string | undefined;
        try {
          url = await uploadPhoto(blob);
        } catch {
          url = undefined;
        }
        setPhotos((p) =>
          p.map((x) => (x.preview === preview ? { preview, url, dark: lum < 0.28, uploading: false, blob } : x))
        );
        if (!url && !navigator.onLine) {
          setError(te("sendFailed"));
        }
      } catch {
        setPhotos((p) => p.filter((x) => x.preview !== preview));
        setError(te("sendFailed"));
      }
    }
  }

  async function generate() {
    const urls = photos.map((p) => p.url).filter(Boolean) as string[];
    if (!heard.trim() || photos.length === 0) {
      setError(te("somethingWrong"));
      return;
    }
    // Offline: AI needs network. Persist raw inputs; she reviews after reconnect.
    if (!navigator.onLine || urls.length === 0) {
      const blobs = photos.map((p) => p.blob).filter((b): b is Blob => b instanceof Blob);
      await saveCreateDraft({ transcript: heard.trim(), photos: blobs, step: 1, savedAt: Date.now() });
      toast(tp("draftSaved"));
      return;
    }
    setBusy(true);
    setError(null);
    const started = Date.now();
    try {
      const r = await fetch("/api/listing/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: heard.trim(), imageUrls: urls, locale }),
      });
      const j = (await r.json()) as { ok?: boolean; draft?: ListingDraft; mocked?: boolean };
      if (!r.ok || !j.draft) throw new Error("ai-failed");
      // Keep the thinking moment visible ~3s total (spec: 3–6s reveal).
      const elapsed = Date.now() - started;
      if (elapsed < 3000) await new Promise((res) => setTimeout(res, 3000 - elapsed));
      setDraft(j.draft);
      setMocked(j.mocked ?? true);
      setPrice(j.draft.suggestedPrice.recommended);
      setStep(2);
      void readDraftSoon(j.draft, j.draft.suggestedPrice.recommended);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function readDraftSoon(d: ListingDraft, p: number) {
    await speak(`${d.title}. ${d.description}. ${t("price")}: ${inr(p)}`);
  }

  async function publish() {
    if (!draft || busy) return;
    const urls = photos.map((p) => p.url).filter(Boolean) as string[];
    // Offline with a reviewed draft: queue the full publish (blobs included).
    if (!navigator.onLine) {
      const blobs = photos.map((p) => p.blob).filter((b): b is Blob => b instanceof Blob);
      await queueWrite("product-publish", {
        draft,
        priceINR: price,
        stock,
        imageUrls: urls,
        photos: blobs,
        fulfillment,
      });
      await clearCreateDraft();
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      toast(tp("queuedPublish"));
      router.push("/app/products");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draft,
          priceINR: price,
          stock,
          imageUrls: urls,
          fulfillment,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; shopSlug?: string; shopName?: string };
      if (!r.ok || !j.shopSlug) throw new Error("publish-failed");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      await clearCreateDraft();
      const pub = { shopSlug: j.shopSlug, shopName: j.shopName ?? "" };
      setPublished(pub);
      setStep(4);
      try {
        const url = `${window.location.origin}/shop/${j.shopSlug}`;
        setQr(await QRCode.toDataURL(url, { width: 320, margin: 2 }));
      } catch {}
      if (navigator.vibrate) navigator.vibrate(60);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  const uploaded = photos.filter((p) => p.url).length;
  const pendingUpload = photos.some((p) => !p.url);
  const pendingBlob = photos.some((p) => !p.blob);
  const onlineNow = typeof navigator === "undefined" || navigator.onLine;
  // Online: need finished uploads. Offline: need compressed blobs. Never generate half-ready.
  const generateBlocked = photos.length === 0 || pendingBlob || (onlineNow && (uploaded === 0 || pendingUpload));
  const shopUrl = published ? `/shop/${published.shopSlug}` : "";
  const waShare =
    published != null
      ? `https://wa.me/?text=${encodeURIComponent(`${t("publishedSub")} ${published.shopName} ${typeof window !== "undefined" ? window.location.origin : ""}${shopUrl}`)}`
      : "";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("newProduct")}</h1>
      <StepDots total={5} current={Math.min(step, 4)} label={t("stepOf", { n: Math.min(step + 1, 5) })} />
      <AuthError message={error} />

      {step === 0 && (
        <section className="flex flex-col items-center gap-4 text-center" aria-label={t("whatSell")}>
          <VoiceOrb state={listening ? "listening" : "idle"} size={132} onTap={() => listen("name")} label={t("sayIt")} />
          <p className="text-xl font-bold">{t("whatSell")}</p>
          <ListenButton text={`${t("whatSell")}`} />
          <BigButton variant="secondary" icon={<Mic aria-hidden />} onClick={() => listen("name")}>
            {listening ? "● ● ●" : t("sayIt")}
          </BigButton>
          {heard && (
            <div className="w-full rounded-[20px] border-2 bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }}>
              <p className="text-sm opacity-70">{t("heardAs")}</p>
              <p className="display text-2xl font-bold">{heard}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <BigButton onClick={() => setStep(1)}>{t("confirmName")}</BigButton>
                <BigButton variant="secondary" onClick={() => { setHeard(""); listen("name"); }}>{t("rerecord")}</BigButton>
              </div>
            </div>
          )}
          <label className="flex w-full flex-col gap-1 text-left text-base font-bold">
            {t("sayIt")} (type)
            <input
              id="create-name"
              value={heard}
              onChange={(e) => setHeard(e.target.value)}
              maxLength={200}
              className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-xl"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          {heard.trim().length >= 2 && (
            <BigButton onClick={() => setStep(1)}>{t("confirmName")}</BigButton>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-3" aria-label={t("takePhoto")}>
          <p className="text-xl font-bold">{t("takePhoto")}</p>
          <p className="text-base opacity-70">{t("takePhotoHint")}</p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p) => (
              <div key={p.preview} className="relative overflow-hidden rounded-[12px] border-2" style={{ borderColor: p.dark ? "var(--madder)" : "var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className="aspect-square w-full object-cover" />
                {p.uploading && !p.url && <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">…</span>}
                {p.dark && <span className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-xs font-bold text-white">🔆</span>}
              </div>
            ))}
            {photos.length < 4 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={t("takePhoto")}
                className="grid aspect-square w-full place-items-center rounded-[12px] border-2 border-dashed"
                style={{ borderColor: "var(--mist)" }}
              >
                <span className="flex flex-col items-center gap-1 font-bold opacity-70">
                  <Camera aria-hidden size={32} />
                  {uploaded}/4
                </span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            aria-hidden
            onChange={(e) => void addFiles(e.target.files)}
          />
          <BigButton onClick={() => void generate()} state={busy ? "loading" : "idle"} disabled={generateBlocked}>
            {pendingUpload && onlineNow ? "… " : ""}{t("reviewTitle")} →
          </BigButton>
        </section>
      )}

      {step === 2 && !draft && (
        <section className="flex flex-col items-center gap-4 py-10 text-center" aria-label={t("thinking")}>
          <VoiceOrb state="thinking" size={132} label={t("thinking")} />
          <p className="text-xl font-bold">{t("thinking")}</p>
          {mocked && <span className="rounded-full bg-[var(--clay-soft)] px-3 py-1 text-sm font-bold">{t("mockBadge")}</span>}
        </section>
      )}

      {step === 2 && draft && (
        <section className="flex flex-col gap-3" aria-label={t("reviewTitle")}>
          <div className="flex items-center gap-2">
            <VoiceOrb state={cmdListening ? "listening" : "idle"} size={72} onTap={() => listen("command")} label={t("voicePriceHint")} />
            <p className="text-sm font-bold opacity-70">{t("aiNote")}</p>
          </div>
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border-2 bg-[var(--card)] p-5"
            style={{ borderColor: "var(--turmeric)" }}
          >
            <label className="flex flex-col gap-1 text-base font-bold">
              Title
              <input
                ref={titleRef}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value.slice(0, 60) })}
                maxLength={60}
                className="min-h-[56px] rounded-[12px] border-2 bg-transparent px-3 text-lg"
                style={{ borderColor: "var(--border)" }}
              />
            </label>
            <label className="mt-2 flex flex-col gap-1 text-base font-bold">
              Description
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value.slice(0, 240) })}
                maxLength={240}
                rows={3}
                className="rounded-[12px] border-2 bg-transparent px-3 py-2 text-base"
                style={{ borderColor: "var(--border)" }}
              />
            </label>
            <div className="mt-2 flex items-center gap-2">
              <PriceTag amount={price} />
              <span className="text-sm opacity-70">{draft.category}</span>
            </div>
          </motion.article>

          <div className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{t("price")}</p>
              <ListenButton text={`${t("price")}: ${inr(price)}`} compact />
            </div>
            <p className="text-sm opacity-70">
              {t("marketBand")}: {inr(draft.suggestedPrice.min)}–{inr(draft.suggestedPrice.max)} · {draft.suggestedPrice.reason}
            </p>
            <input
              type="range"
              min={Math.max(1, draft.suggestedPrice.min - 50)}
              max={draft.suggestedPrice.max + 100}
              step={5}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              aria-label={t("price")}
              className="mt-2 min-h-[56px] w-full"
            />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setPrice((p) => Math.max(1, p - 10))} aria-label="Decrease price" className="grid min-h-[56px] min-w-[56px] place-items-center rounded-full border-2" style={{ borderColor: "var(--border)" }}>
                <Minus aria-hidden />
              </button>
              <p className="display text-3xl font-bold">{inr(price)}</p>
              <button type="button" onClick={() => setPrice((p) => p + 10)} aria-label="Increase price" className="grid min-h-[56px] min-w-[56px] place-items-center rounded-full border-2" style={{ borderColor: "var(--border)" }}>
                <Plus aria-hidden />
              </button>
            </div>
          </div>

          <BigButton variant="secondary" icon={<Mic aria-hidden />} onClick={() => listen("command")}>
            {cmdListening ? "● ● ●" : t("voicePriceHint")}
          </BigButton>
          <BigButton onClick={() => setStep(3)}>{t("stock")} →</BigButton>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-3" aria-label={t("stock")}>
          <p className="text-xl font-bold">{t("stock")}</p>
          <div className="flex items-center justify-center gap-6 rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
            <button type="button" onClick={() => setStock((s) => Math.max(1, s - 1))} aria-label="Decrease stock" className="grid min-h-[64px] min-w-[64px] place-items-center rounded-full border-2" style={{ borderColor: "var(--border)" }}>
              <Minus aria-hidden />
            </button>
            <p className="display text-5xl font-bold" role="status">{stock}</p>
            <button type="button" onClick={() => setStock((s) => Math.min(100000, s + 1))} aria-label="Increase stock" className="grid min-h-[64px] min-w-[64px] place-items-center rounded-full border-2" style={{ borderColor: "var(--border)" }}>
              <Plus aria-hidden />
            </button>
          </div>
          <p className="text-xl font-bold">{t("delivery")}</p>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label={t("delivery")}>
            {(["pickup", "delivery", "both"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFulfillment(f)}
                aria-pressed={fulfillment === f}
                className="min-h-[64px] rounded-[12px] border-2 px-2 text-base font-bold"
                style={{ borderColor: fulfillment === f ? "var(--turmeric)" : "var(--border)", background: fulfillment === f ? "var(--clay-soft)" : "var(--card)" }}
              >
                {f === "pickup" ? t("pickup") : f === "delivery" ? t("deliveryOpt") : t("both")}
              </button>
            ))}
          </div>
          <BigButton onClick={() => void publish()} state={busy ? "loading" : "idle"}>
            <span className="inline-flex items-center gap-2"><Check aria-hidden /> {t("publish")}</span>
          </BigButton>
          <p className="text-center text-sm opacity-70">{t("voicePublishHint")}</p>
        </section>
      )}

      {step === 4 && published && (
        <section className="relative flex flex-col items-center gap-4 py-6 text-center" aria-label={t("published")}>
          <ConfettiBurst fire />
          <VoiceOrb state="success" size={120} label={t("published")} />
          <h2 className="display text-3xl font-bold">{t("published")}</h2>
          <p className="text-lg opacity-80">{t("publishedSub")} {published.shopName}</p>
          <div className="w-full">
            <InstallCard />
          </div>
          <div className="w-full rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
            <p className="text-lg font-bold">{t("shareShop")}</p>
            <p className="mt-1 break-all text-base underline" style={{ color: "var(--indigo)" }}>{shopUrl}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={waShare} target="_blank" rel="noreferrer" className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--leaf)] px-4 text-lg font-bold text-white">
                {t("whatsappShare")}
              </a>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(`${window.location.origin}${shopUrl}`).then(() => setCopied(true));
                }}
                className="min-h-[64px] rounded-[20px] border-2 px-4 text-lg font-bold"
                style={{ borderColor: "var(--border)" }}
              >
                {copied ? t("copied") : t("copyLink")}
              </button>
            </div>
            {qr && (
              <div className="mt-3 flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt={t("qrPoster")} className="h-40 w-40 rounded-[12px] border" style={{ borderColor: "var(--border)" }} />
                <a href={qr} download="ojas-shop-qr.png" className="text-base font-bold underline" style={{ color: "var(--indigo)" }}>
                  {t("qrPoster")}
                </a>
              </div>
            )}
          </div>
          <BigButton onClick={() => router.push(shopUrl)}>{t("viewShop")}</BigButton>
          <button type="button" onClick={() => router.push("/app/products")} className="min-h-[56px] text-base font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("myProducts")}
          </button>
        </section>
      )}
    </main>
  );
}
