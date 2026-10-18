"use client";
import { signIn } from "next-auth/react";

/** Exchange a verify-API ticket for an Auth.js session, then go next. */
export async function ticketSignIn(ticket: string): Promise<{ ok: boolean; error?: string }> {
  const res = await signIn("credentials", { mode: "ticket", ticket, redirect: false });
  if (!res) return { ok: false, error: "somethingWrong" };
  if (res.error) return { ok: false, error: "somethingWrong" };
  return { ok: true };
}

export type VerifyOk = { ok: true; ticket: string; name?: string; hasPin?: boolean; role?: string };
export type VerifyErr = { ok: false; code: string };

const ERROR_MAP: Record<string, string> = {
  "otp-wrong": "otpWrong",
  "otp-expired": "otpExpired",
  "otp-locked": "otpLocked",
  "invalid-phone": "invalidPhone",
  "invalid-otp": "invalidOtp",
  "invalid-pin": "invalidPin",
  "invalid-card": "invalidCard",
  "invalid-upi": "invalidUpi",
  "invalid-name": "invalidName",
  "no-account": "noAccount",
  "pin-wrong": "pinWrong",
  "pin-locked": "pinLocked",
  "rate-limited": "rateLimited",
  "pin-mismatch": "pinMismatch",
  "send-failed": "sendFailed",
  "something-wrong": "somethingWrong",
  "invalid-credentials": "pinWrong",
};

export function normalizeAuthError(code?: string): string {
  if (!code) return "somethingWrong";
  return ERROR_MAP[code] ?? code.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await r.json()) as T;
}

export function verifyOtpApi(phone: string, otp: string, create: boolean) {
  return post<VerifyOk | VerifyErr>("/api/auth/otp/verify", { phone, otp, create: create ? "1" : "0" });
}

export function sendOtpApi(phone: string) {
  return post<{ ok: boolean; demoOtp?: string; code?: string }>("/api/auth/otp/send", { phone });
}

export function verifyPinApi(phone: string, pin: string) {
  return post<VerifyOk | VerifyErr>("/api/auth/pin/verify", { phone, pin });
}

export function staffVerifyApi(email: string, password: string) {
  return post<VerifyOk | VerifyErr>("/api/auth/staff/verify", { email, password });
}
