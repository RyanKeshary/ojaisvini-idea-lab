"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mic } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError } from "@/components/auth/AuthError";
import { DemoSmsBanner } from "@/components/auth/DemoSmsBanner";
import { BigButton } from "@/components/ui/BigButton";
import { OTPInput } from "@/components/ui/OTPInput";
import { PinPad } from "@/components/ui/PinPad";
import { StepDots } from "@/components/ui/StepDots";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { ListenButton } from "@/components/voice/ListenButton";
import { OjasDidi } from "@/components/ui/OjasDidi";
import { sendOtpApi, verifyOtpApi, ticketSignIn } from "@/lib/auth/client";
import { normalizePhone } from "@/lib/auth/phone";
import { updateMyName, setMyPin } from "@/lib/auth/actions";
import { getSTT } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";

const STEPS = 6;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const te = useTranslations("auth.errors");
  const router = useRouter();
  const { locale } = usePrefs();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [sttError, setSttError] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const sttRef = useRef<ReturnType<typeof getSTT> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => () => sttRef.current?.stop(), []);

  async function send() {
    setError(null);
    setBusy(true);
    try {
      const r = await sendOtpApi(phone);
      if (!r.ok) {
        setError(te((r.code ?? "sendFailed") as "sendFailed"));
        return;
      }
      setDemoOtp(r.demoOtp);
      setCooldown(30);
      setStep(1);
    } catch {
      setError(te("sendFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const v = await verifyOtpApi(normalizePhone(phone), otp, true);
      if (!v.ok) {
        setError(te((v as { code: string }).code as "otpWrong"));
        return;
      }
      const s = await ticketSignIn((v as { ticket: string }).ticket);
      if (!s.ok) {
        setError(te("somethingWrong"));
        return;
      }
      setStep(2);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  function listenForName() {
    const stt = getSTT();
    sttRef.current = stt;
    setSttError(false);
    if (!stt.supported) {
      setSttError(true);
      return;
    }
    setListening(true);
    stt.start(
      locale,
      (tr) => {
        setHeard(tr.text);
        if (tr.final) {
          setListening(false);
          stt.stop();
        }
      },
      () => {
        setListening(false);
        setSttError(true);
      }
    );
  }

  async function saveName(finalName: string) {
    setError(null);
    if (finalName.trim().length < 2) {
      setError(te("invalidName"));
      return;
    }
    setBusy(true);
    try {
      const r = await updateMyName(finalName.trim());
      if (!r.ok) {
        setError(te((r.error ?? "somethingWrong") as "somethingWrong"));
        return;
      }
      setName(finalName.trim());
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  async function savePin() {
    setError(null);
    if (pin.length !== 4 || pin2.length !== 4) {
      setError(te("invalidPin"));
      return;
    }
    if (pin !== pin2) {
      setError(te("pinMismatch"));
      setPin("");
      setPin2("");
      return;
    }
    setBusy(true);
    try {
      const r = await setMyPin(pin);
      if (!r.ok) {
        setError(te("somethingWrong"));
        return;
      }
      setStep(4);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("register")}>
      <StepDots total={STEPS} current={step} />
      <AuthError message={error} />

      {step === 0 && (
        <>
          <ListenButton text={`${t("register")}. ${t("phoneHint")}.`} />
          <label className="flex flex-col gap-1 text-base font-bold">
            {t("phone")}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="98XXXXXXXX"
              className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-xl tracking-wide"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-sm font-normal opacity-70">{t("phoneHint")}</span>
          </label>
          <BigButton onClick={send} state={busy ? "loading" : "idle"}>{t("sendOtp")}</BigButton>
          <Link href="/auth/login" className="place-self-center text-base font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("haveAccount")}
          </Link>
        </>
      )}

      {step === 1 && (
        <>
          <DemoSmsBanner code={demoOtp} hint={t("demoOtp")} />
          <OTPInput value={otp} onChange={setOtp} />
          <BigButton onClick={verify} state={busy ? "loading" : "idle"}>{t("verify")}</BigButton>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={send}
            className="min-h-[56px] text-base font-bold underline disabled:opacity-50"
            style={{ color: "var(--indigo)" }}
          >
            {cooldown > 0 ? t("resendIn", { s: cooldown }) : t("resend")}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex items-center gap-4">
            <VoiceOrb state={listening ? "listening" : "idle"} size={104} onTap={listenForName} label={t("sayName")} />
            <div>
              <p className="text-lg font-bold">{t("sayName")}</p>
              <ListenButton text={t("sayName")} compact />
            </div>
          </div>
          <BigButton variant="secondary" icon={<Mic aria-hidden />} onClick={listenForName}>
            {listening ? "● ● ●" : t("sayName")}
          </BigButton>
          {sttError && <p className="text-sm opacity-70">{t("typeInstead")}</p>}
          {heard && !name && (
            <div className="rounded-[20px] border-2 bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }}>
              <p className="text-lg">{t("confirmName", { name: heard })}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <BigButton onClick={() => void saveName(heard)}>{tc("yes")}</BigButton>
                <BigButton variant="secondary" onClick={() => { setHeard(""); listenForName(); }}>{t("rerecord")}</BigButton>
              </div>
            </div>
          )}
          <label className="flex flex-col gap-1 text-base font-bold">
            {t("typeInstead")}
            <input
              value={heard}
              onChange={(e) => setHeard(e.target.value)}
              autoComplete="name"
              maxLength={60}
              className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-xl"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <BigButton onClick={() => void saveName(heard)} state={busy ? "loading" : "idle"}>{tc("confirm")}</BigButton>
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-lg font-bold">{t("choosePin")}</p>
          <PinPad value={pin} onChange={(v) => setPin(v.slice(0, 4))} />
          <p className="text-lg font-bold">{t("confirmPin")}</p>
          <PinPad value={pin2} onChange={(v) => setPin2(v.slice(0, 4))} />
          <BigButton onClick={savePin} state={busy ? "loading" : "idle"}>{t("setPin")}</BigButton>
        </>
      )}

      {step === 4 && (
        <>
          <p className="text-lg font-bold">{t("photoOptional")}</p>
          <CameraCapture />
          <BigButton onClick={() => setStep(5)}>{tc("next")}</BigButton>
          <button type="button" onClick={() => setStep(5)} className="min-h-[56px] text-base font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("skipPhoto")}
          </button>
        </>
      )}

      {step === 5 && (
        <div className="relative flex flex-col items-center gap-4 py-6 text-center">
          <ConfettiBurst fire />
          <VoiceOrb state="success" size={120} label="Success" />
          <OjasDidi mood="celebrating" size={110} />
          <h2 className="display text-3xl font-bold">{t("doneTitle")}</h2>
          {name && <p className="text-xl font-bold" style={{ color: "var(--madder)" }}>{t("welcome")} {name}</p>}
          <BigButton onClick={() => router.push("/app/home")}>{tc("next")}</BigButton>
        </div>
      )}
    </AuthShell>
  );
}
