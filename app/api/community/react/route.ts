import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

const KINDS = ["love", "clap", "pray", "bulb"] as const;

/** Toggle a reaction (no downvotes, ever). */
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
      kind: z.enum(KINDS),
    })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { targetType, targetId, kind } = parsed.data;
  const exists =
    targetType === "post"
      ? await db.post.findUnique({ where: { id: targetId } })
      : await db.reply.findUnique({ where: { id: targetId } });
  if (!exists) return NextResponse.json({ code: "not-found" }, { status: 404 });

  const prior = await db.reaction.findUnique({
    where: { targetType_targetId_userId_kind: { targetType, targetId, userId: session.user.id, kind } },
  });
  if (prior) {
    await db.reaction.delete({ where: { id: prior.id } });
    return NextResponse.json({ ok: true, on: false });
  }
  await db.reaction.create({ data: { targetType, targetId, userId: session.user.id, kind } });
  return NextResponse.json({ ok: true, on: true });
}
