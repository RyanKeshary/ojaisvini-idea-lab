import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

/** User directory (search by phone/name). Phones masked. */
export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const q = (new URL(req.url).searchParams.get("q") || "").slice(0, 30);
  const users = await db.user.findMany({
    where: q
      ? { OR: [{ phone: { contains: q } }, { name: { contains: q } }] }
      : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, phone: true, name: true, role: true, locale: true, village: true, createdAt: true, sakhiId: true },
  });
  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({
      ...u,
      phone: `${u.phone.slice(0, 2)}••••${u.phone.slice(6)}`,
    })),
  });
}

/** Change a user's role (audited). */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z
    .object({ userId: z.string().min(1).max(64), role: z.enum(["WOMAN", "SAKHI", "MENTOR", "ADMIN"]) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  if (parsed.data.userId === session.user.id) {
    return NextResponse.json({ code: "no-self-demote" }, { status: 400 });
  }
  await db.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "admin.role", meta: JSON.stringify(parsed.data) },
  });
  return NextResponse.json({ ok: true });
}
