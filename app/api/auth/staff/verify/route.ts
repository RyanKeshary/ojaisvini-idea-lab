import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPassword } from "@/lib/auth/pin";
import { issueTicket } from "@/lib/auth/ticket";
import { staffSchema } from "@/lib/validation/auth";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid-email", 400);
  }
  const parsed = staffSchema.safeParse(body);
  if (!parsed.success) return err("invalid-email", 400);
  const rl = rateLimit(`staffverify:${clientIp(req.headers)}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return err("rate-limited", 429);

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user || !user.passwordHash || !["SAKHI", "ADMIN", "MENTOR"].includes(user.role)) {
    return err("no-account", 404);
  }
  const ok = await checkPassword(parsed.data.password, user.passwordHash);
  if (!ok) return err("pin-wrong", 401);
  const ticket = await issueTicket(user.id);
  return NextResponse.json({ ok: true, ticket, role: user.role });
}

function err(code: string, status: number) {
  return NextResponse.json({ code, messageKey: `auth.errors.${code}` }, { status });
}
