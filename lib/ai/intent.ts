import { z } from "zod";
import { parseReviewCommand } from "@/lib/voice/commands";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";

/** Structured voice intents. Rule parser runs FIRST; Groq only on low confidence. */
export const intentSchema = z.object({
  intent: z.enum([
    "confirm",
    "reject",
    "set_price",
    "set_stock",
    "rename",
    "navigate",
    "help",
    "unknown",
  ]),
  value: z.union([z.number(), z.string()]).optional(),
});

export type Intent = z.infer<typeof intentSchema>;
export type IntentSource = "rule" | "groq" | "mock";

function fromRule(text: string): Intent | null {
  const cmd = parseReviewCommand(text);
  switch (cmd.kind) {
    case "SET_PRICE":
      return { intent: "set_price", value: cmd.price };
    case "PUBLISH":
      return { intent: "confirm" };
    case "RERECORD":
      return { intent: "reject" };
    case "READ":
      // No chatbot yet: help = read the draft aloud (client maps help → read).
      return { intent: "help" };
    default:
      return null; // UNKNOWN needs Groq fallback
  }
}

const INTENT_SYSTEM = [
  "You map a short voice command from a rural Indian woman entrepreneur to one JSON intent.",
  "Intents: confirm (yes/publish it), reject (no/redo/say again), set_price (with a number),",
  "set_stock (with a number), rename (change the name), navigate (go somewhere: orders/shop/home), help (question/how-to).",
  "Hindi/Marathi/Hinglish input. Numbers may be words: ek sau pachaas=150, dedh sau=150, shambhar=100.",
  "Respond with ONLY the JSON object. Temperature is low; when unsure use intent unknown.",
].join(" ");

/**
 * Rule-first intent resolution with Groq fast-model fallback.
 * Mock provider (default) never calls the network: rule hit or unknown.
 */
export async function resolveIntent(
  text: string,
  opts?: { userId?: string }
): Promise<{ intent: Intent; source: IntentSource }> {
  const ruled = fromRule(text);
  if (ruled) return { intent: ruled, source: "rule" };

  const provider = getAIProvider();
  if (provider.name === "mock") {
    return { intent: { intent: "unknown" }, source: "mock" };
  }
  const started = Date.now();
  try {
    const res = await provider.chat({
      system: INTENT_SYSTEM,
      userText: text.slice(0, 200),
      temperature: 0.2,
      maxTokens: 100,
      json: true,
      fast: true,
      timeoutMs: 8000,
    });
    const parsed = intentSchema.safeParse(JSON.parse(res.text));
    const intent = parsed.success ? parsed.data : { intent: "unknown" as const };
    logAIUsage({
      feature: "intent.resolve",
      provider: "groq",
      model: res.model,
      latencyMs: Date.now() - started,
      promptTokens: res.promptTokens,
      completionTokens: res.completionTokens,
      userId: opts?.userId,
    });
    return { intent, source: "groq" };
  } catch (e) {
    console.error("[ai] intent fallback failed", e);
    return { intent: { intent: "unknown" }, source: "groq" };
  }
}
