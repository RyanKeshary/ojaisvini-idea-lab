import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { JOURNEYS, BADGES } from "@/lib/learn/catalog";

/** My learning progress: per-lesson status + earned badges. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const lessons = await db.lesson.findMany({ orderBy: [{ journey: "asc" }, { order: "asc" }] });
  const progress = await db.lessonProgress.findMany({ where: { userId: session.user.id } });
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const badges = await db.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
  });
  return NextResponse.json({
    ok: true,
    journeys: JOURNEYS.map((j) => ({
      id: j.id,
      icon: j.icon,
      lessons: lessons
        .filter((l) => l.journey === j.id)
        .map((l) => ({
          key: l.contentRef,
          order: l.order,
          status: byLesson.get(l.id)?.status ?? "NEW",
          score: byLesson.get(l.id)?.score ?? null,
        })),
    })),
    badges: badges.map((b) => ({ code: b.badge.code, icon: (BADGES[b.badge.code] || { icon: "🏅" }).icon, earnedAt: b.earnedAt })),
  });
}
