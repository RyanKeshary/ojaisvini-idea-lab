import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createOtp, isDemo } from "@/lib/auth/otp";
import { phoneSchema } from "@/lib/validation/auth";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { getSmsProvider } from "@/lib/sms/provider";

const bodySchema = z.object({ phone: phoneSchema });

/** Send/generate OTP. Demo: returns the code as an on-screen "SMS" + accepts 123456. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-phone", messageKey: "auth.errors.invalidPhone" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid-phone", messageKey: "auth.errors.invalidPhone" }, { status: 400 });
  }
  const { phone } = parsed.data;
  const rlPhone = rateLimit(`otp:phone:${phone}`, 5, 10 * 60 * 1000);
  if (!rlPhone.ok) {
    return NextResponse.json({ code: "rate-limited", messageKey: "auth.errors.rateLimited" }, { status: 429 });
  }
  const rlIp = rateLimit(`otp:ip:${clientIp(req.headers)}`, 20, 60 * 60 * 1000);
  if (!rlIp.ok) {
    return NextResponse.json({ code: "rate-limited", messageKey: "auth.errors.rateLimited" }, { status: 429 });
  }
  const { code } = await createOtp(phone);
  await getSmsProvider().send(phone, `Ojasvini code: ${code}. Kisi se share na karein.`);
  await db.auditLog.create({ data: { action: "otp.sent", meta: JSON.stringify({ phone: `${phone.slice(0, 2)}••••${phone.slice(6)}` }) } });
  if (isDemo()) {
    return NextResponse.json({ ok: true, demoOtp: code });
  }
  return NextResponse.json({ ok: true });
}
