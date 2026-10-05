import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { cacheGet, cacheSet } from "@/lib/ai/cache";
import { rateLimit } from "@/lib/auth/rate-limit";

/** Translate a post into the reader's language (cached). Mock returns original honestly. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const rl = rateLimit(`ai:${session.user.id}`, 20, 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z
    .object({ postId: z.string().min(1).max(64), locale: z.enum(["hi", "mr", "en"]).default("hi") })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const post = await db.post.findUnique({ where: { id: parsed.data.postId } });
  if (!post || post.status !== "VISIBLE") return NextResponse.json({ code: "not-found" }, { status: 404 });
  const parts = { post: post.id, text: post.text, locale: parsed.data.locale };
  const cached = await cacheGet<string>("community-translate", parts);
  if (cached) return NextResponse.json({ ok: true, text: cached, cached: true });

  const provider = getAIProvider();
  if (provider.name === "mock") {
    return NextResponse.json({ ok: true, text: post.text, cached: false, mocked: true, note: "original" });
  }
  const started = Date.now();
  try {
    const res = await provider.chat({
      system: `Translate this forum post into ${parsed.data.locale}. Keep meaning, keep it simple. Output ONLY the translation.`,
      userText: post.text.slice(0, 800),
      temperature: 0.2,
      maxTokens: 300,
      timeoutMs: 8000,
    });
    await cacheSet("community-translate", parts, res.text, 30 * 24 * 60 * 60 * 1000);
    logAIUsage({ feature: "community.translate", provider: "groq", model: res.model, latencyMs: Date.now() - started, promptTokens: res.promptTokens, completionTokens: res.completionTokens, userId: session.user.id });
    return NextResponse.json({ ok: true, text: res.text, cached: false, mocked: false });
  } catch (e) {
    console.error("[ai] translate failed", e);
    return NextResponse.json({ ok: true, text: post.text, cached: false, mocked: true, degraded: true, note: "original" });
  }
}
