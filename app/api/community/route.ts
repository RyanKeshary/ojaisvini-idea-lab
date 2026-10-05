import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { precheck, stripPhones } from "@/lib/community/moderate";
import { displayName, roleBadge } from "@/lib/community/display";
import { rateLimit } from "@/lib/auth/rate-limit";

const ROOMS = ["food", "craft", "tailor", "dairy", "money", "tech", "wins"];
const TYPES = ["question", "win", "tip"];

/** Feed: room filter, Latest/Popular, cursor pagination. Only VISIBLE posts. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const room = q.get("room") || "";
  const sort = q.get("sort") === "popular" ? "popular" : "latest";
  const cursor = q.get("cursor") || "";
  const take = 10;

  const posts = await db.post.findMany({
    where: { status: "VISIBLE", ...(room && ROOMS.includes(room) ? { room } : {}) },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { name: true, village: true, role: true } },
      replies: { select: { id: true } },
    },
  });
  const ids = posts.map((p) => p.id);
  const reactions = await db.reaction.groupBy({
    by: ["targetId", "kind"],
    where: { targetType: "post", targetId: { in: ids } },
    _count: { kind: true },
  });
  const byPost = new Map<string, Record<string, number>>();
  for (const r of reactions) {
    const m = byPost.get(r.targetId) || {};
    m[r.kind] = r._count.kind;
    byPost.set(r.targetId, m);
  }
  let items = posts.slice(0, take).map((p) => ({
    id: p.id,
    room: p.room,
    type: p.category,
    text: p.text,
    audioUrl: p.audioUrl,
    imageUrl: p.imageUrl,
    locale: p.locale,
    author: displayName(p.author, p.anon),
    authorRole: p.anon ? null : roleBadge(p.author.role),
    best: !!p.bestReplyId,
    replies: p.replies.length,
    reactions: byPost.get(p.id) || {},
    createdAt: p.createdAt,
  }));
  if (sort === "popular") {
    items = items.sort(
      (a, b) =>
        Object.values(b.reactions).reduce((x, y) => x + y, 0) + b.replies * 2 -
        (Object.values(a.reactions).reduce((x, y) => x + y, 0) + a.replies * 2)
    );
  }
  return NextResponse.json({ ok: true, posts: items, nextCursor: posts.length > take ? posts[take].id : null });
}

const createSchema = z.object({
  room: z.enum(["food", "craft", "tailor", "dairy", "money", "tech", "wins"]),
  type: z.enum(["question", "win", "tip"]),
  text: z.string().trim().min(2).max(1000),
  imageUrl: z.string().regex(/^\/uploads\/[A-Za-z0-9_.-]+$/).optional(),
  audioUrl: z.string().regex(/^\/uploads\/[A-Za-z0-9_.-]+$/).optional(),
  anon: z.boolean().default(false),
});

/** Create a post: PII stripped, AI pre-screened, auto-moderated. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const rl = rateLimit(`forum:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const text = stripPhones(parsed.data.text);
  const check = await precheck(text, session.user.id);
  const post = await db.post.create({
    data: {
      authorId: session.user.id,
      category: parsed.data.type,
      room: parsed.data.room,
      anon: parsed.data.anon,
      text,
      imageUrl: parsed.data.imageUrl,
      audioUrl: parsed.data.audioUrl,
      locale: "mr",
      status: check.flagged ? "FLAGGED" : "VISIBLE",
    },
  });
  return NextResponse.json({ ok: true, id: post.id, status: post.status, reasons: check.reasons });
}
