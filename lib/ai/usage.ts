import { db } from "@/lib/db";

export type UsageEntry = {
  feature: string;
  provider: "groq" | "mock";
  model: string;
  degraded?: boolean;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  userId?: string;
};

/**
 * Fire-and-forget AI usage/cost log. Server only. No PII, no prompt text —
 * only feature, model, tokens, latency. Never throws, never blocks.
 */
export function logAIUsage(entry: UsageEntry): void {
  db.aiUsageLog
    .create({
      data: {
        feature: entry.feature,
        provider: entry.provider,
        model: entry.model,
        degraded: entry.degraded ?? false,
        latencyMs: entry.latencyMs,
        promptTokens: entry.promptTokens,
        completionTokens: entry.completionTokens,
        userId: entry.userId,
      },
    })
    .catch((e) => console.error("[ai] usage log failed", e));
}
