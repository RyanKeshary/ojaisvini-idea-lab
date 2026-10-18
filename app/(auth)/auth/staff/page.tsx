"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError } from "@/components/auth/AuthError";
import { BigButton } from "@/components/ui/BigButton";
import { staffVerifyApi, ticketSignIn } from "@/lib/auth/client";

export default function StaffLoginPage() {
  const t = useTranslations("auth");
  const te = useTranslations("auth.errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setError(null);
    setBusy(true);
    try {
      const v = await staffVerifyApi(email, password);
      if (!v.ok) {
        const code = (v as { code?: string }).code;
        if (code === "pin-wrong") {
          setError("Incorrect password. Demo password is: demo1234");
        } else if (code === "rate-limited") {
          setError("Too many attempts. Please wait a moment.");
        } else if (code === "invalid-email") {
          setError("Please enter a valid email address.");
        } else {
          setError("No staff account found for this email. Use sakhi@ojas.demo or admin@ojas.demo");
        }
        return;
      }
      const s = await ticketSignIn((v as { ticket: string }).ticket);
      if (!s.ok) {
        setError(te("somethingWrong"));
        return;
      }
      const role = (v as { role?: string }).role;
      router.push(role === "ADMIN" ? "/admin" : "/sakhi-console");
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(targetEmail: string, targetPass: string) {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
    setBusy(true);
    try {
      const v = await staffVerifyApi(targetEmail, targetPass);
      if (!v.ok) {
        const code = (v as { code?: string }).code;
        if (code === "pin-wrong") {
          setError("Incorrect password. Demo password is: demo1234");
        } else {
          setError("Demo staff account error. Please try again.");
        }
        return;
      }
      const s = await ticketSignIn((v as { ticket: string }).ticket);
      if (!s.ok) {
        setError(te("somethingWrong"));
        return;
      }
      const role = (v as { role?: string }).role;
      router.push(role === "ADMIN" ? "/admin" : "/sakhi-console");
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("staffLogin")}>
      <AuthError message={error} />
      <label className="flex flex-col gap-1 text-base font-bold">
        {t("email")}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
          placeholder="sakhi@ojas.demo or admin@ojas.demo"
          className="min-h-[60px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-lg"
          style={{ borderColor: "var(--border)" }}
        />
      </label>

      {/* Helpful demo account fill pills */}
      <div className="flex items-center gap-2 -mt-2">
        <span className="text-xs opacity-60">Demo:</span>
        <button
          type="button"
          onClick={() => {
            setEmail("sakhi@ojas.demo");
            setPassword("demo1234");
            setError(null);
          }}
          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[var(--card)] hover:border-[var(--turmeric)] transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          sakhi@ojas.demo
        </button>
        <button
          type="button"
          onClick={() => {
            setEmail("admin@ojas.demo");
            setPassword("demo1234");
            setError(null);
          }}
          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[var(--card)] hover:border-[var(--turmeric)] transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          admin@ojas.demo
        </button>
      </div>

      <label className="flex flex-col gap-1 text-base font-bold">
        {t("password")}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="demo1234"
          className="min-h-[60px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-lg"
          style={{ borderColor: "var(--border)" }}
        />
      </label>
      <BigButton onClick={login} state={busy ? "loading" : "idle"}>{t("login")}</BigButton>

      {/* Instant Demo Access Buttons */}
      <div className="mt-2 flex flex-col gap-2 rounded-[16px] border border-dashed p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <p className="text-center text-sm font-bold opacity-80">⚡ One-Click Demo Access</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => quickLogin("admin@ojas.demo", "demo1234")}
            className="flex min-h-[52px] items-center justify-center rounded-[12px] bg-[var(--madder)] px-3 text-center text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50 hover:opacity-90"
          >
            👑 Admin Access
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => quickLogin("sakhi@ojas.demo", "demo1234")}
            className="flex min-h-[52px] items-center justify-center rounded-[12px] bg-[var(--indigo)] px-3 text-center text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50 hover:opacity-90"
          >
            🤝 Sakhi Access
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => quickLogin("sakhi@ojas.demo", "demo1234")}
        className="min-h-[44px] text-center text-base font-bold underline transition-opacity active:opacity-60"
        style={{ color: "var(--indigo)" }}
      >
        {t("demoAccess")} (Auto Login)
      </button>
    </AuthShell>
  );
}
