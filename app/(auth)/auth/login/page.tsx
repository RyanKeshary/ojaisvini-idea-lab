"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError } from "@/components/auth/AuthError";
import { DemoSmsBanner } from "@/components/auth/DemoSmsBanner";
import { BigButton } from "@/components/ui/BigButton";
import { OTPInput } from "@/components/ui/OTPInput";
import { PinPad } from "@/components/ui/PinPad";
import { StepDots } from "@/components/ui/StepDots";
import { ListenButton } from "@/components/voice/ListenButton";
import { sendOtpApi, verifyOtpApi, verifyPinApi, ticketSignIn } from "@/lib/auth/client";
import { normalizePhone } from "@/lib/auth/phone";

function useNext(): string {
  const sp = useSearchParams();
  const n = sp.get("next") ?? "/app/home";
  return n.startsWith("/") ? n : "/app/home";
}

function LoginInner() {
  const t = useTranslations("auth");
  const te = useTranslations("auth.errors");
  const next = useNext();
  const router = useRouter();
  const [tab, setTab] = useState<"otp" | "pin">("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinErrKey, setPinErrKey] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

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
      setSent(true);
      setCooldown(30);
    } catch {
      setError(te("sendFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function loginOtp() {
    setError(null);
    setBusy(true);
    try {
      const v = await verifyOtpApi(normalizePhone(phone), otp, false);
      if (!v.ok) {
        setError(te((v as { code: string }).code as "otpWrong"));
        return;
      }
      const s = await ticketSignIn((v as { ticket: string }).ticket);
      if (!s.ok) {
        setError(te("somethingWrong"));
        return;
      }
      router.push(next);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function loginPin() {
    setError(null);
    setBusy(true);
    try {
      const v = await verifyPinApi(normalizePhone(phone), pin);
      if (!v.ok) {
        const code = (v as { code: string }).code;
        setError(te(code as "pinWrong"));
        setPinErrKey((k) => k + 1);
        setPin("");
        return;
      }
      const s = await ticketSignIn((v as { ticket: string }).ticket);
      if (!s.ok) {
        setError(te("somethingWrong"));
        return;
      }
      router.push(next);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("login")}>
      <ListenButton text={`${t("login")}. ${t("phoneHint")}.`} />
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label={t("login")}>
        {(["otp", "pin"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={tab === m}
            onClick={() => { setTab(m); setError(null); }}
            className="min-h-[56px] rounded-[12px] border-2 text-base font-bold"
            style={{ borderColor: tab === m ? "var(--turmeric)" : "var(--border)", background: tab === m ? "var(--clay-soft)" : "var(--card)" }}
          >
            {m === "otp" ? t("useOtp") : t("usePin")}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-base font-bold">
        {t("phone")}
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
          inputMode="tel"
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          aria-describedby="phone-hint"
          className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-xl tracking-wide"
          style={{ borderColor: "var(--border)" }}
        />
        <span id="phone-hint" className="text-sm font-normal opacity-70">{t("phoneHint")}</span>
      </label>

      {tab === "otp" ? (
        !sent ? (
          <BigButton onClick={send} state={busy ? "loading" : "idle"}>{t("sendOtp")}</BigButton>
        ) : (
          <>
            <DemoSmsBanner code={demoOtp} hint={t("demoOtp")} />
            <OTPInput value={otp} onChange={setOtp} />
            <BigButton onClick={loginOtp} state={busy ? "loading" : "idle"}>{t("verify")}</BigButton>
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
        )
      ) : (
        <>
          <PinPad value={pin} onChange={(v) => setPin(v.slice(0, 4))} errorKey={pinErrKey} />
          <BigButton onClick={loginPin} state={busy ? "loading" : "idle"}>{t("login")}</BigButton>
          <Link href="/auth/forgot-pin" className="min-h-[56px] place-self-center text-base font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("forgotPin")}
          </Link>
        </>
      )}

      <AuthError message={error} />
      <Link href="/auth/register" className="min-h-[56px] place-self-center text-base font-bold underline" style={{ color: "var(--indigo)" }}>
        {t("newHere")}
      </Link>
      <Link href="/auth/staff" className="min-h-[48px] place-self-center text-sm font-bold underline opacity-70" style={{ color: "var(--indigo)" }}>
        Sakhi / Admin →
      </Link>
      <StepDots total={2} current={0} label="Login" />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
