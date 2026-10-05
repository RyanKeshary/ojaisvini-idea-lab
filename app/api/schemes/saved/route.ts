import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** My saved schemes with checklist state. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const saved = await db.savedScheme.findMany({
    where: { userId: session.user.id },
    include: { scheme: true },
  });
  return NextResponse.json({
    ok: true,
    saved: saved.map((s) => ({
      schemeId: s.schemeId,
      name: s.scheme.name,
      checklist: JSON.parse(s.checklistState) as Record<string, boolean>,
    })),
  });
}

/** Save / unsave toggle + checklist update. */
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
    .object({
      schemeId: z.string().min(1).max(64),
      save: z.boolean().default(true),
      checklist: z.record(z.string(), z.boolean()).optional(),
    })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const scheme = await db.scheme.findUnique({ where: { id: parsed.data.schemeId } });
  if (!scheme) return NextResponse.json({ code: "not-found" }, { status: 404 });

  if (!parsed.data.save) {
    await db.savedScheme.deleteMany({ where: { userId: session.user.id, schemeId: scheme.id } });
    return NextResponse.json({ ok: true, saved: false });
  }
  const existing = await db.savedScheme.findUnique({
    where: { userId_schemeId: { userId: session.user.id, schemeId: scheme.id } },
  });
  if (existing && parsed.data.checklist) {
    const merged = { ...(JSON.parse(existing.checklistState) as Record<string, boolean>), ...parsed.data.checklist };
    await db.savedScheme.update({ where: { id: existing.id }, data: { checklistState: JSON.stringify(merged) } });
    return NextResponse.json({ ok: true, saved: true, checklist: merged });
  }
  if (!existing) {
    await db.savedScheme.create({
      data: {
        userId: session.user.id,
        schemeId: scheme.id,
        checklistState: JSON.stringify(parsed.data.checklist ?? {}),
      },
    });
  }
  return NextResponse.json({ ok: true, saved: true });
}
