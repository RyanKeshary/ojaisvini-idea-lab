import { createHash, randomInt, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
const DEMO_CODE = "123456";

export function isDemo(): boolean {
  return process.env.OJAS_DEMO === "1" || process.env.NEXT_PUBLIC_DEMO === "1";
}

function hashCode(phone: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHash("sha256").update(`${secret}:${phone}:${code}`).digest("hex");
}

export async function createOtp(phone: string): Promise<{ code: string; expiresAt: Date }> {
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.otpToken.deleteMany({ where: { phone } });
  await db.otpToken.create({
    data: { phone, hash: hashCode(phone, code), expiresAt, attempts: 0 },
  });
  return { code, expiresAt };
}

/** Verify an OTP. Demo mode always accepts 123456. Returns {ok, error?}. */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: "otp-expired" | "otp-wrong" | "otp-locked" }> {
  if (isDemo() && code === DEMO_CODE) return { ok: true };
  const token = await db.otpToken.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (!token) return { ok: false, error: "otp-expired" };
  if (token.expiresAt.getTime() < Date.now()) {
    await db.otpToken.delete({ where: { id: token.id } });
    return { ok: false, error: "otp-expired" };
  }
  if (token.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "otp-locked" };
  }
  const a = Buffer.from(token.hash);
  const b = Buffer.from(hashCode(phone, code));
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) {
    const attempts = token.attempts + 1;
    await db.otpToken.update({ where: { id: token.id }, data: { attempts } });
    return { ok: false, error: attempts >= OTP_MAX_ATTEMPTS ? "otp-locked" : "otp-wrong" };
  }
  await db.otpToken.delete({ where: { id: token.id } });
  return { ok: true };
}
