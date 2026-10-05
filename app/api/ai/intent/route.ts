import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { resolveIntent } from "@/lib/ai/intent";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const bodySchema = z.object({ text: z.string().trim().min(1).max(200) });

function aiBudget(): number {
  const n = parseInt(process.env.AI_CALLS_PER_MIN || "20", 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

/**
 * Voice intent: rule-based hi/mr parser FIRST, Groq fast-model only when the
 * rules have low confidence. Mock provider returns rule-or-unknown, no network.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const rlUser = rateLimit(`ai:${session.user.id}`, aiBudget(), 60 * 1000);
  if (!rlUser.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  const rlIp = rateLimit(`ai:ip:${clientIp(req.headers)}`, 60, 60 * 1000);
  if (!rlIp.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const { intent, source } = await resolveIntent(parsed.data.text, { userId: session.user.id });
  return NextResponse.json({ ok: true, intent: intent.intent, value: intent.value, source });
}
