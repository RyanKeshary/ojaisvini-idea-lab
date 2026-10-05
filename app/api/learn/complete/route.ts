import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { LESSON_BADGE, BADGES } from "@/lib/learn/catalog";
import { lessonContent } from "@/lib/learn/content";

/** Complete a lesson: validates it exists, saves score, awards badges (idempotent). */
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
    .object({ key: z.string().min(1).max(40), score: z.number().int().min(0).max(100).default(100) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { key, score } = parsed.data;
  const userId = session.user.id;

  const lesson = await db.lesson.findFirst({ where: { contentRef: key } });
  if (!lesson || !lessonContent(key, "en")) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    update: { status: "DONE", score, completedAt: new Date() },
    create: { userId, lessonId: lesson.id, status: "DONE", score, completedAt: new Date() },
  });

  const fresh: string[] = [];
  async function award(code: string) {
    const badge = await db.badge.findUnique({ where: { code } });
    if (!badge) return;
    const existing = await db.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (!existing) {
      await db.userBadge.create({ data: { userId, badgeId: badge.id } });
      fresh.push(code);
    }
  }
  await award("first-step");
  if (LESSON_BADGE[key]) await award(LESSON_BADGE[key]);

  return NextResponse.json({
    ok: true,
    newBadges: fresh.map((code) => ({ code, icon: (BADGES[code] || { icon: "🏅" }).icon })),
  });
}
