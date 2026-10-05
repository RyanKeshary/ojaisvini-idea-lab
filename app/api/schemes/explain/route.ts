import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { cacheGet, cacheSet } from "@/lib/ai/cache";
import { schemeExplainerPrompt } from "@/lib/ai/prompts/schemes";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

function aiBudget(): number {
  const n = parseInt(process.env.AI_CALLS_PER_MIN || "20", 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

function mockExplain(benefit: string, documents: string[], locale: string): string[] {
  const docs = documents.length ? documents.join(", ") : "official site par dekhein";
  if (locale === "mr") {
    return [
      `He tumchyasathi aahe: ${benefit}`,
      `Kagadpatra: ${docs}.`,
      "Pahil paul: Sakhi la vichara, ti form bharayla madat karel.",
    ];
  }
  if (locale === "gu") {
    return [
      `Aa tamaara maate chhe: ${benefit}`,
      `Kaagado: ${docs}.`,
      "Pehlu paglu: Sakhi ne puchho, form bharvaamaa madad karashe.",
    ];
  }
  if (locale === "ta") {
    return [
      `Idhu unakkaaga: ${benefit}`,
      `Aavanangal: ${docs}.`,
      "Mudhal adi: Sakhi-yidam kelu, form-ai nirappa udhavuvaar.",
    ];
  }
  if (locale === "hi") {
    return [
      `Ye aapke liye hai: ${benefit}`,
      `Kagaz: ${docs}.`,
      "Pehla kadam: Sakhi se poochein, form bharne mein madad karegi.",
    ];
  }
  return [
    `This is for you: ${benefit}`,
    `Documents: ${docs}.`,
    "First step: ask your Sakhi; she will help with the form.",
  ];
}

/** Plain-language explanation, cached per (scheme, benefits-hash, locale). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const rl = rateLimit(`ai:${session.user.id}`, aiBudget(), 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });
  const rlIp = rateLimit(`ai:ip:${clientIp(req.headers)}`, 60, 60 * 1000);
  if (!rlIp.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ schemeId: z.string().min(1).max(64), locale: z.enum(["hi", "mr", "en", "gu", "ta", "te", "kn", "bn"]).default("hi") }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });

  const scheme = await db.scheme.findUnique({ where: { id: parsed.data.schemeId } });
  if (!scheme) return NextResponse.json({ code: "not-found" }, { status: 404 });
  const supported = ["hi", "mr", "en", "gu", "ta"] as const;
  const locale: (typeof supported)[number] = (supported as readonly string[]).includes(parsed.data.locale)
    ? (parsed.data.locale as (typeof supported)[number])
    : "hi";
  const benefits = JSON.parse(scheme.benefits) as Record<string, string>;
  const benefit = benefits[locale] || benefits.en || "";
  const documents = JSON.parse(scheme.documents) as string[];

  const parts = { scheme: scheme.id, benefits: scheme.benefits, locale };
  const cached = await cacheGet<string[]>("scheme-explain", parts);
  if (cached) return NextResponse.json({ ok: true, points: cached, cached: true, mocked: true });

  const provider = getAIProvider();
  if (provider.name === "mock") {
    const points = mockExplain(benefit, documents, locale);
    await cacheSet("scheme-explain", parts, points, 30 * 24 * 60 * 60 * 1000);
    return NextResponse.json({ ok: true, points, cached: false, mocked: true });
  }
  const { system, user } = schemeExplainerPrompt({ schemeName: scheme.name, benefit, documents, locale });
  const started = Date.now();
  try {
    const res = await provider.chat({ system, userText: user, temperature: 0.4, maxTokens: 300, timeoutMs: 8000 });
    const points = res.text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 6);
    if (points.length === 0) throw new Error("ai-empty");
    await cacheSet("scheme-explain", parts, points, 30 * 24 * 60 * 60 * 1000);
    logAIUsage({ feature: "scheme.explain", provider: "groq", model: res.model, latencyMs: Date.now() - started, promptTokens: res.promptTokens, completionTokens: res.completionTokens, userId: session.user.id });
    return NextResponse.json({ ok: true, points, cached: false, mocked: false });
  } catch (e) {
    console.error("[ai] explain failed, mock fallback", e);
    const points = mockExplain(benefit, documents, locale);
    return NextResponse.json({ ok: true, points, cached: false, mocked: true, degraded: true });
  }
}
