import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";

/** Mask phone numbers (privacy: no public phone numbers, ever). */
export function stripPhones(text: string): string {
  return text
    .replace(/\+?91[\s-]?[6-9]\d{4}[\s-]?\d{5}/g, "••••••")
    .replace(/(?<![\d])[6-9]\d{9}(?![\d])/g, "••••••");
}

const SCAM_RX =
  /(lottery|prize.*won|double (your|the) money|2x (return|profit)|investment.*guarantee|job.*fee|pay.*unlock|kbc.*winner|free.*recharge.*link)/i;
const ABUSE_RX = /(stupid|idiot|hate you|shut up|pagal|bewakoof|nalayak|bewaqoof)/i;

export type Precheck = { flagged: boolean; reasons: string[] };

/** Instant mock screen (always runs). Groq fast-model second opinion when configured. */
export async function precheck(text: string, userId?: string): Promise<Precheck> {
  const clean = stripPhones(text);
  const reasons: string[] = [];
  if (SCAM_RX.test(clean)) reasons.push("scam");
  if (ABUSE_RX.test(clean)) reasons.push("abuse");
  const mock: Precheck = { flagged: reasons.length > 0, reasons };

  const provider = getAIProvider();
  if (provider.name === "mock") return mock;
  const started = Date.now();
  try {
    const res = await provider.chat({
      system: [
        "You moderate a women's community forum post.",
        "Flag ONLY: scams (lottery/prize/double-money/job fees), abuse/harassment, phone numbers, medical/financial guarantees.",
        "Respond ONLY JSON: {ok: true} or {ok: false, reason: 'scam'|'abuse'|'pii'}.",
      ].join(" "),
      userText: clean.slice(0, 500),
      temperature: 0,
      maxTokens: 60,
      json: true,
      fast: true,
      timeoutMs: 6000,
    });
    const parsed = JSON.parse(res.text) as { ok?: boolean; reason?: string };
    logAIUsage({ feature: "community.moderate", provider: "groq", model: res.model, latencyMs: Date.now() - started, promptTokens: res.promptTokens, completionTokens: res.completionTokens, userId });
    if (parsed.ok === false) {
      return { flagged: true, reasons: [...reasons, String(parsed.reason || "ai")] };
    }
    return mock;
  } catch (e) {
    console.error("[ai] moderation fallback to mock", e);
    return mock;
  }
}
