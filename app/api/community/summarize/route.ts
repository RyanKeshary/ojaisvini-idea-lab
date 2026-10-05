import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { cacheGet, cacheSet } from "@/lib/ai/cache";
import { rateLimit } from "@/lib/auth/rate-limit";

/**
 * Summarize a thread. Mock = honest extractive summary (first answers +
 * counts), so the button is useful with no key. Groq = abstractive.
 */
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
  const parsed = z.object({ postId: z.string().min(1).max(64) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const post = await db.post.findUnique({
    where: { id: parsed.data.postId },
    include: { replies: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!post || post.status !== "VISIBLE") return NextResponse.json({ code: "not-found" }, { status: 404 });
  const parts = { post: post.id, replies: post.replies.length, updated: post.replies.at(-1)?.createdAt ?? post.createdAt };
  const cached = await cacheGet<string>("community-summary", parts);
  if (cached) return NextResponse.json({ ok: true, summary: cached, cached: true });

  const provider = getAIProvider();
  const extractive = [
    `${post.replies.length} jawab aaye hain.`,
    ...post.replies.slice(0, 2).map((r) => `• ${r.text.slice(0, 120)}`),
  ].join("\n");

  if (provider.name === "mock") {
    await cacheSet("community-summary", parts, extractive, 7 * 24 * 60 * 60 * 1000);
    return NextResponse.json({ ok: true, summary: extractive, cached: false, mocked: true });
  }
  const started = Date.now();
  try {
    const res = await provider.chat({
      system: "Summarize this women's forum thread in 3 short lines in the reader's language (Hindi unless the text is clearly Marathi/English). Simple words.",
      userText: `Q: ${post.text}\n` + post.replies.map((r, i) => `A${i + 1}: ${r.text}`).join("\n").slice(0, 1500),
      temperature: 0.4,
      maxTokens: 200,
      timeoutMs: 8000,
    });
    await cacheSet("community-summary", parts, res.text, 7 * 24 * 60 * 60 * 1000);
    logAIUsage({ feature: "community.summarize", provider: "groq", model: res.model, latencyMs: Date.now() - started, promptTokens: res.promptTokens, completionTokens: res.completionTokens, userId: session.user.id });
    return NextResponse.json({ ok: true, summary: res.text, cached: false, mocked: false });
  } catch (e) {
    console.error("[ai] summarize failed", e);
    return NextResponse.json({ ok: true, summary: extractive, cached: false, mocked: true, degraded: true });
  }
}
