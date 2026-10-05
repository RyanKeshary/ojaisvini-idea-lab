import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPin, PIN_MAX_FAILS, PIN_LOCK_MS } from "@/lib/auth/pin";
import { issueTicket } from "@/lib/auth/ticket";
import { pinSchema } from "@/lib/validation/auth";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid-phone", 400);
  }
  const parsed = pinSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    return err(issue === "invalid-pin" ? "invalid-pin" : "invalid-phone", 400);
  }
  const { phone, pin } = parsed.data;
  const rl = rateLimit(`pinverify:${clientIp(req.headers)}`, 30, 10 * 60 * 1000);
  if (!rl.ok) return err("rate-limited", 429);

  const user = await db.user.findUnique({ where: { phone } });
  if (!user || !user.pinHash || user.deletedAt) return err("no-account", 404);
  if (user.pinLockedUntil && user.pinLockedUntil.getTime() > Date.now()) {
    return err("pin-locked", 423);
  }
  const ok = await checkPin(pin, user.pinHash);
  if (!ok) {
    const fails = user.pinFails + 1;
    const locked = fails >= PIN_MAX_FAILS;
    await db.user.update({
      where: { id: user.id },
      data: { pinFails: fails, pinLockedUntil: locked ? new Date(Date.now() + PIN_LOCK_MS) : null },
    });
    await db.auditLog.create({ data: { actorId: user.id, action: locked ? "pin.locked" : "pin.failed", meta: "{}" } });
    return err(locked ? "pin-locked" : "pin-wrong", 401);
  }
  await db.user.update({ where: { id: user.id }, data: { pinFails: 0, pinLockedUntil: null } });
  const ticket = await issueTicket(user.id);
  return NextResponse.json({ ok: true, ticket, name: user.name });
}

function err(code: string, status: number) {
  return NextResponse.json({ code, messageKey: `auth.errors.${code}` }, { status });
}
