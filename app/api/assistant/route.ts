import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { sellerContext } from "@/lib/ai/context";
import { assistantPrompt, mockReply, splitAction } from "@/lib/ai/prompts/assistant";
import { flagOn } from "@/lib/admin/guards";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

function aiBudget(): number {
  const n = parseInt(process.env.AI_CALLS_PER_MIN || "20", 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
  threadId: z.string().min(1).max(64).nullish(),
  locale: z.enum(["hi", "mr", "en", "gu", "ta"]).default("hi"),
});

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Sakhi Didi assistant: streams tokens (SSE), grounded in her shop data.
 * Mock provider streams deterministic keyword replies; Groq streams live.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  if (!(await flagOn("assistant_enabled"))) {
    return NextResponse.json({ code: "disabled" }, { status: 503 });
  }
  const userId = session.user.id;
  const rl = rateLimit(`ai:${userId}`, aiBudget(), 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  const rlIp = rateLimit(`ai:ip:${clientIp(req.headers)}`, 60, 60 * 1000);
  if (!rlIp.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { message, locale } = parsed.data;

  let thread = parsed.data.threadId
    ? await db.chatThread.findFirst({ where: { id: parsed.data.threadId, userId } })
    : null;
  if (!thread) {
    thread = await db.chatThread.create({ data: { userId, title: message.slice(0, 40) } });
  }
  const threadId = thread.id;
  await db.chatMessage.create({ data: { threadId, role: "user", content: message } });
  const history = await db.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const context = await sellerContext(userId);
  const provider = getAIProvider();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (d: unknown) => controller.enqueue(new TextEncoder().encode(sse(d)));
      const started = Date.now();
      try {
        if (provider.name === "mock") {
          const { reply, action } = mockReply(message, context, locale);
          // Word-by-word stream so the UI path is identical to live mode.
          for (const w of reply.split(" ")) {
            send({ token: w + " " });
            await new Promise((r) => setTimeout(r, 24));
          }
          await db.chatMessage.create({
            data: { threadId, role: "assistant", content: reply, meta: JSON.stringify({ action: action ?? null, mocked: true }) },
          });
          send({ done: true, threadId, action: action ?? null, mocked: true });
        } else {
          const { system } = assistantPrompt({ locale, context });
          const prior = [...history]
            .reverse()
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
          // groq-sdk streaming
          const { default: Groq } = await import("groq-sdk");
          const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const { MODELS } = await import("@/lib/ai/provider");
          const model = MODELS.chat;
          const completion = await client.chat.completions.create(
            {
              model,
              temperature: 0.6,
              max_tokens: 300,
              messages: [{ role: "system", content: system }, ...prior.slice(-10)],
              stream: true,
            },
            { signal: AbortSignal.timeout(30000) }
          );
          let full = "";
          let promptTokens: number | undefined;
          let completionTokens: number | undefined;
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              full += delta;
              send({ token: delta });
            }
            const usage = (chunk as { x_groq?: { usage?: { prompt_tokens?: number; completion_tokens?: number } } }).x_groq?.usage;
            if (usage) {
              promptTokens = usage.prompt_tokens;
              completionTokens = usage.completion_tokens;
            }
          }
          const { text, action } = splitAction(full);
          await db.chatMessage.create({
            data: { threadId, role: "assistant", content: text || full, meta: JSON.stringify({ action: action ?? null, model }) },
          });
          logAIUsage({ feature: "assistant.chat", provider: "groq", model, latencyMs: Date.now() - started, promptTokens, completionTokens, userId });
          send({ done: true, threadId, action: action ?? null, mocked: false });
        }
      } catch (e) {
        console.error("[ai] assistant failed, mock fallback", e);
        const { reply, action } = mockReply(message, context, locale);
        send({ token: reply + " " });
        await db.chatMessage.create({
          data: { threadId, role: "assistant", content: reply, meta: JSON.stringify({ action: action ?? null, mocked: true, degraded: true }) },
        });
        send({ done: true, threadId, action: action ?? null, mocked: true, degraded: true });
      } finally {
        try {
          await db.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
        } catch {}
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

/** Recent thread history (for reload continuity). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const threadId = new URL(req.url).searchParams.get("threadId");
  const thread = threadId
    ? await db.chatThread.findFirst({ where: { id: threadId, userId: session.user.id } })
    : await db.chatThread.findFirst({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  if (!thread) return NextResponse.json({ ok: true, threadId: null, messages: [] });
  const messages = await db.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  return NextResponse.json({
    ok: true,
    threadId: thread.id,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      feedback: m.feedback,
      action: (() => {
        try {
          return (JSON.parse(m.meta) as { action?: { name: string; value: string } | null }).action ?? null;
        } catch {
          return null;
        }
      })(),
    })),
  });
}
