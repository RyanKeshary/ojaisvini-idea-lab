"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError } from "@/components/auth/AuthError";
import { DemoSmsBanner } from "@/components/auth/DemoSmsBanner";
import { BigButton } from "@/components/ui/BigButton";
import { OTPInput } from "@/components/ui/OTPInput";
import { PinPad } from "@/components/ui/PinPad";
import { StepDots } from "@/components/ui/StepDots";
import { sendOtpApi, verifyOtpApi, ticketSignIn } from "@/lib/auth/client";
import { normalizePhone } from "@/lib/auth/phone";
import { setMyPin } from "@/lib/auth/actions";

export default function ForgotPinPage() {
  const t = useTranslations("auth");
  const te = useTranslations("auth.errors");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>();
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setStep(2);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
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
      router.push("/app/home");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("forgotPin")}>
      <StepDots total={3} current={step} />
      <AuthError message={error} />
      {step === 0 && (
        <>
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
          </label>
          <BigButton onClick={send} state={busy ? "loading" : "idle"}>{t("sendOtp")}</BigButton>
        </>
      )}
      {step === 1 && (
        <>
          <DemoSmsBanner code={demoOtp} hint={t("demoOtp")} />
          <OTPInput value={otp} onChange={setOtp} />
          <BigButton onClick={verify} state={busy ? "loading" : "idle"}>{t("verify")}</BigButton>
        </>
      )}
      {step === 2 && (
        <>
          <p className="text-lg font-bold">{t("newPin")}</p>
          <PinPad value={pin} onChange={(v) => setPin(v.slice(0, 4))} />
          <p className="text-lg font-bold">{t("confirmPin")}</p>
          <PinPad value={pin2} onChange={(v) => setPin2(v.slice(0, 4))} />
          <BigButton onClick={save} state={busy ? "loading" : "idle"}>{t("setPin")}</BigButton>
        </>
      )}
    </AuthShell>
  );
}
