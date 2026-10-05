import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** "Was this helpful?" feedback on an assistant message. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ messageId: z.string().min(1).max(64), helpful: z.boolean() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const msg = await db.chatMessage.findUnique({
    where: { id: parsed.data.messageId },
    include: { thread: { select: { userId: true } } },
  });
  if (!msg || msg.thread.userId !== session.user.id || msg.role !== "assistant") {
    return NextResponse.json({ code: "not-found" }, { status: 404 });
  }
  await db.chatMessage.update({ where: { id: msg.id }, data: { feedback: parsed.data.helpful ? 1 : -1 } });
  return NextResponse.json({ ok: true });
}
