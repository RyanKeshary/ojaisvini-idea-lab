import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/auth/otp";
import { issueTicket } from "@/lib/auth/ticket";
import { phoneSchema, otpSchema } from "@/lib/validation/auth";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid-phone", 400);
  }
  const create = (body as { create?: string })?.create === "1";
  const parsed = otpSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    return err(issue === "invalid-otp" ? "invalid-otp" : "invalid-phone", 400);
  }
  const { phone, otp } = parsed.data;
  const rl = rateLimit(`otpverify:${clientIp(req.headers)}`, 30, 10 * 60 * 1000);
  if (!rl.ok) return err("rate-limited", 429);

  const v = await verifyOtp(phone, otp);
  if (!v.ok) return err(v.error, 401);

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    if (!create) return err("no-account", 404);
    try {
      phoneSchema.parse(phone);
    } catch {
      return err("invalid-phone", 400);
    }
    user = await db.user.create({ data: { phone, name: "", role: "WOMAN" } });
    await db.auditLog.create({ data: { actorId: user.id, action: "user.registered", meta: "{}" } });
  }
  if (user.deletedAt) return err("no-account", 404);
  const ticket = await issueTicket(user.id);
  return NextResponse.json({ ok: true, ticket, name: user.name, hasPin: !!user.pinHash });
}

function err(code: string, status: number) {
  return NextResponse.json({ code, messageKey: `auth.errors.${code}` }, { status });
}
