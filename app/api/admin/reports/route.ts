import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

/** Moderation queue: open reports + flagged posts. */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const [reports, flagged] = await Promise.all([
    db.report.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.post.findMany({
      where: { status: { in: ["FLAGGED", "HIDDEN"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { name: true, phone: true } } },
    }),
  ]);
  return NextResponse.json({
    ok: true,
    reports,
    flagged: flagged.map((p) => ({
      id: p.id,
      text: p.text.slice(0, 160),
      status: p.status,
      author: p.author.name || p.author.phone,
    })),
  });
}

/** Resolve: dismiss (REVIEWED) or hide (post HIDDEN / reply deleted). */
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
    .object({ reportId: z.string().min(1).max(64), action: z.enum(["dismiss", "hide"]) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const report = await db.report.findUnique({ where: { id: parsed.data.reportId } });
  if (!report) return NextResponse.json({ code: "not-found" }, { status: 404 });

  if (parsed.data.action === "hide") {
    if (report.targetType === "post") {
      await db.post.updateMany({ where: { id: report.targetId }, data: { status: "HIDDEN" } });
    } else {
      await db.reply.deleteMany({ where: { id: report.targetId } });
    }
  }
  await db.report.update({ where: { id: report.id }, data: { status: "REVIEWED" } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "admin.moderate", meta: JSON.stringify(parsed.data) },
  });
  return NextResponse.json({ ok: true });
}
