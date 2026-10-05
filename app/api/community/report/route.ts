import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** Report content. 3+ open reports auto-hide the target for review. */
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
      targetType: z.enum(["post", "reply"]),
      targetId: z.string().min(1).max(64),
      reason: z.string().max(200).default(""),
    })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { targetType, targetId, reason } = parsed.data;

  await db.report.create({ data: { reporterId: session.user.id, targetType, targetId, reason } });
  const count = await db.report.count({ where: { targetType, targetId, status: "OPEN" } });
  if (count >= 3) {
    if (targetType === "post") {
      await db.post.updateMany({ where: { id: targetId }, data: { status: "HIDDEN" } });
    }
    // Replies: hiding is handled by hiding the parent post in the admin queue (Phase 7).
  }
  return NextResponse.json({ ok: true, reports: count });
}
