import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** In-app inbox (new orders, payouts, nudges). Newest first. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const items = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    ok: true,
    unread: items.filter((i) => !i.readAt).length,
    notifications: items.map((i) => ({
      id: i.id,
      kind: i.kind,
      payload: JSON.parse(i.payload || "{}"),
      read: !!i.readAt,
      createdAt: i.createdAt,
    })),
  });
}

/** Mark read: { ids: [...] } or { all: true }. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z
    .object({ ids: z.array(z.string()).max(50).optional(), all: z.boolean().default(false) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  if (parsed.data.all) {
    await db.notification.updateMany({ where: { userId: session.user.id, readAt: null }, data: { readAt: new Date() } });
  } else if (parsed.data.ids?.length) {
    await db.notification.updateMany({
      where: { userId: session.user.id, id: { in: parsed.data.ids } },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}
