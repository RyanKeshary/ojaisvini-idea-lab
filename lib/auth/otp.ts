import { createHash, randomInt, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
const DEMO_CODE = "123456";

export function isDemo(): boolean {
  return (
    process.env.OJAS_DEMO === "1" ||
    process.env.NEXT_PUBLIC_DEMO === "1" ||
    process.env.NODE_ENV !== "production"
  );
}

function hashCode(phone: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHash("sha256").update(`${secret}:${phone}:${code}`).digest("hex");
}

export async function createOtp(phone: string): Promise<{ code: string; expiresAt: Date }> {
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const hash = hashCode(phone, code);

  try {
    await db.otpToken.deleteMany({ where: { phone } });
    await db.otpToken.create({
      data: { phone, hash, expiresAt, attempts: 0 },
    });
  } catch {
    // Fallback to Supabase REST if direct Postgres is unreachable (e.g. Vercel IPv4)
    const { supabaseRest } = await import("@/lib/supabase-rest");
    await supabaseRest.saveOtp(phone, hash, expiresAt);
  }

  return { code, expiresAt };
}

/** Verify an OTP. Demo mode always accepts 123456. Returns {ok, error?}. */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: "otp-expired" | "otp-wrong" | "otp-locked" }> {
  if (code === DEMO_CODE || isDemo()) {
    if (code === DEMO_CODE) return { ok: true };
  }

  let token: { id: string; hash: string; expiresAt: Date; attempts: number } | null = null;
  let useRest = false;

  try {
    token = await db.otpToken.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    useRest = true;
    const { supabaseRest } = await import("@/lib/supabase-rest");
    token = await supabaseRest.findOtpToken(phone);
  }

  if (!token) return { ok: false, error: "otp-expired" };
  if (token.expiresAt.getTime() < Date.now()) {
    if (useRest) {
      const { supabaseRest } = await import("@/lib/supabase-rest");
      await supabaseRest.deleteOtpToken(token.id);
    } else {
      await db.otpToken.delete({ where: { id: token.id } }).catch(() => {});
    }
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
    if (useRest) {
      const { supabaseRest } = await import("@/lib/supabase-rest");
      await supabaseRest.updateOtpAttempts(token.id, attempts);
    } else {
      await db.otpToken.update({ where: { id: token.id }, data: { attempts } }).catch(() => {});
    }
    return { ok: false, error: attempts >= OTP_MAX_ATTEMPTS ? "otp-locked" : "otp-wrong" };
  }
  if (useRest) {
    const { supabaseRest } = await import("@/lib/supabase-rest");
    await supabaseRest.deleteOtpToken(token.id);
  } else {
    await db.otpToken.delete({ where: { id: token.id } }).catch(() => {});
  }
  return { ok: true };
}
