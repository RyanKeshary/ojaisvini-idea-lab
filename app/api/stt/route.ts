import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024; // ~30s of webm/opus, client caps at 10s

function aiBudget(): number {
  const n = parseInt(process.env.AI_CALLS_PER_MIN || "20", 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

/**
 * Whisper STT fallback — used ONLY when Web Speech STT is unavailable.
 * Mock provider (default) answers 503 so the UI falls through to typed input.
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

  const provider = getAIProvider();
  if (provider.name === "mock") {
    return NextResponse.json({ code: "stt-unavailable" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }
  const audio = form.get("audio");
  const lang = z
    .string()
    .regex(/^[a-z]{2}$/)
    .safeParse(form.get("lang"));
  if (!(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_BYTES) {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }
  const started = Date.now();
  try {
    const buf = Buffer.from(await audio.arrayBuffer());
    const { text, model } = await provider.transcribe(buf, lang.success ? lang.data : undefined);
    logAIUsage({
      feature: "stt.transcribe",
      provider: "groq",
      model,
      latencyMs: Date.now() - started,
      userId: session.user.id,
    });
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    console.error("[ai] stt failed", e);
    return NextResponse.json({ code: "stt-failed" }, { status: 502 });
  }
}
