import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** Mark best answer (post author only). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ postId: z.string().min(1).max(64), replyId: z.string().min(1).max(64) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const post = await db.post.findUnique({ where: { id: parsed.data.postId } });
  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json({ code: "forbidden" }, { status: 403 });
  }
  const reply = await db.reply.findUnique({ where: { id: parsed.data.replyId } });
  if (!reply || reply.postId !== post.id) return NextResponse.json({ code: "not-found" }, { status: 404 });
  await db.post.update({ where: { id: post.id }, data: { bestReplyId: reply.id } });
  return NextResponse.json({ ok: true });
}
