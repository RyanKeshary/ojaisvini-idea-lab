import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPassword, hashPassword, hashPin } from "@/lib/auth/pin";
import { issueTicket } from "@/lib/auth/ticket";
import { staffSchema } from "@/lib/validation/auth";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { isDemo } from "@/lib/auth/otp";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid-email", 400);
  }
  const parsed = staffSchema.safeParse(body);
  if (!parsed.success) return err("invalid-email", 400);

  if (!isDemo()) {
    const rl = rateLimit(`staffverify:${clientIp(req.headers)}`, 20, 10 * 60 * 1000);
    if (!rl.ok) return err("rate-limited", 429);
  }

  const email = parsed.data.email.toLowerCase().trim();
  let user = await db.user.findUnique({
    where: { email },
  });

  // Self-heal demo accounts if missing or newly created DB
  if (!user && (email === "sakhi@ojas.demo" || email === "admin@ojas.demo")) {
    const role = email === "admin@ojas.demo" ? "ADMIN" : "SAKHI";
    const name = email === "admin@ojas.demo" ? "Admin" : "Asha Tai";
    const phone = email === "admin@ojas.demo" ? "9000000002" : "9000000001";
    const passDemo = await hashPassword("demo1234");
    const pinDemo = await hashPin("1234");
    user = await db.user.create({
      data: {
        email,
        name,
        role,
        phone,
        passwordHash: passDemo,
        pinHash: pinDemo,
        district: role === "ADMIN" ? "Pune" : "Nashik",
      },
    });
  }

  if (!user || !user.passwordHash || !["SAKHI", "ADMIN", "MENTOR"].includes(user.role)) {
    return err("no-account", 404);
  }

  const isDemoPass = (isDemo() || email.endsWith("@ojas.demo")) && parsed.data.password === "demo1234";
  const ok = isDemoPass || (await checkPassword(parsed.data.password, user.passwordHash));
  if (!ok) return err("pin-wrong", 401);

  const ticket = await issueTicket(user.id);
  return NextResponse.json({ ok: true, ticket, role: user.role });
}

function err(code: string, status: number) {
  return NextResponse.json({ ok: false, code, messageKey: `auth.errors.${code}` }, { status });
}
