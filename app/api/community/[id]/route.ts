import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { precheck, stripPhones } from "@/lib/community/moderate";
import { displayName, roleBadge } from "@/lib/community/display";
import { rateLimit } from "@/lib/auth/rate-limit";

/** Thread detail: post + replies + my reactions. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, village: true, role: true, id: true } },
      replies: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, village: true, role: true } } } },
    },
  });
  if (!post || (post.status !== "VISIBLE" && post.author.id !== session.user.id)) {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  const reactions = await db.reaction.groupBy({
    by: ["targetId", "kind"],
    where: { targetType: { in: ["post", "reply"] } },
    _count: { kind: true },
  });
  const mine = await db.reaction.findMany({
    where: { userId: session.user.id, targetType: { in: ["post", "reply"] } },
  });
  const counts = new Map<string, Record<string, number>>();
  for (const r of reactions) {
    const m = counts.get(r.targetId) || {};
    m[r.kind] = r._count.kind;
    counts.set(r.targetId, m);
  }
  return NextResponse.json({
    ok: true,
    post: {
      id: post.id,
      room: post.room,
      type: post.category,
      text: post.text,
      audioUrl: post.audioUrl,
      imageUrl: post.imageUrl,
      locale: post.locale,
      status: post.status,
      author: displayName(post.author, post.anon),
      authorRole: post.anon ? null : roleBadge(post.author.role),
      mine: post.author.id === session.user.id,
      bestReplyId: post.bestReplyId,
      createdAt: post.createdAt,
      reactions: counts.get(post.id) || {},
      myReactions: mine.filter((r) => r.targetType === "post" && r.targetId === post.id).map((r) => r.kind),
    },
    replies: post.replies.map((rp) => ({
      id: rp.id,
      text: rp.text,
      audioUrl: rp.audioUrl,
      author: displayName(rp.author, false),
      authorRole: roleBadge(rp.author.role),
      verified: rp.verified,
      best: post.bestReplyId === rp.id,
      createdAt: rp.createdAt,
      reactions: counts.get(rp.id) || {},
      myReactions: mine.filter((r) => r.targetType === "reply" && r.targetId === rp.id).map((r) => r.kind),
    })),
  });
}

const replySchema = z.object({
  text: z.string().trim().min(1).max(1000),
  audioUrl: z.string().regex(/^\/uploads\/[A-Za-z0-9_.-]+$/).optional(),
});

/** Reply (Sakhi/mentor replies auto-verified). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const rl = rateLimit(`forum:${session.user.id}`, 30, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.status !== "VISIBLE") return NextResponse.json({ code: "not-found" }, { status: 404 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const text = stripPhones(parsed.data.text);
  const check = await precheck(text, session.user.id);
  if (check.flagged) return NextResponse.json({ code: "blocked", reasons: check.reasons }, { status: 422 });
  const me = await db.user.findUnique({ where: { id: session.user.id } });
  const verified = me ? ["SAKHI", "ADMIN", "MENTOR"].includes(me.role) : false;
  const reply = await db.reply.create({
    data: { postId: id, authorId: session.user.id, text, audioUrl: parsed.data.audioUrl, verified },
  });
  return NextResponse.json({ ok: true, id: reply.id, verified });
}
