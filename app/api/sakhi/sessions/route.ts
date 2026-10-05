import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function staffOnly(role?: string): boolean {
  return !!role && ["SAKHI", "ADMIN", "MENTOR"].includes(role);
}

/** Mentor check-ins with my mentees. */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !staffOnly(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const sessions = await db.sakhiSession.findMany({
    where: { sakhiId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { woman: { select: { name: true, phone: true } } },
  });
  return NextResponse.json({
    ok: true,
    sessions: sessions.map((s) => ({
      id: s.id,
      woman: s.woman.name || s.woman.phone,
      type: s.type,
      notes: s.notes,
      scheduledAt: s.scheduledAt,
      createdAt: s.createdAt,
    })),
  });
}

const createSchema = z.object({
  womanId: z.string().min(1).max(64),
  type: z.enum(["visit", "call", "training", "followup", "problem"]),
  notes: z.string().max(500).default(""),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
});

/** Log a check-in (only for my mentees). */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !staffOnly(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const woman = await db.user.findUnique({ where: { id: parsed.data.womanId } });
  const allowed = role === "ADMIN" || (woman && woman.sakhiId === session.user.id);
  if (!woman || !allowed) return NextResponse.json({ code: "forbidden" }, { status: 403 });
  const s = await db.sakhiSession.create({
    data: {
      sakhiId: session.user.id,
      womanId: woman.id,
      type: parsed.data.type,
      notes: parsed.data.notes,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    },
  });
  return NextResponse.json({ ok: true, id: s.id });
}
