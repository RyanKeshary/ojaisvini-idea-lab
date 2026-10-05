import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

/** AI usage/cost dashboard: calls, avg latency, tokens by feature + provider. */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  const rows = await db.aiUsageLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const byFeature = new Map<string, { calls: number; ms: number; prompt: number; completion: number; degraded: number }>();
  for (const r of rows) {
    const m = byFeature.get(r.feature) || { calls: 0, ms: 0, prompt: 0, completion: 0, degraded: 0 };
    m.calls++;
    m.ms += r.latencyMs;
    m.prompt += r.promptTokens || 0;
    m.completion += r.completionTokens || 0;
    if (r.degraded) m.degraded++;
    byFeature.set(r.feature, m);
  }
  return NextResponse.json({
    ok: true,
    total: rows.length,
    byFeature: [...byFeature.entries()].map(([feature, m]) => ({
      feature,
      ...m,
      avgMs: m.calls ? Math.round(m.ms / m.calls) : 0,
    })),
    recent: rows.slice(0, 30).map((r) => ({
      feature: r.feature,
      provider: r.provider,
      model: r.model,
      degraded: r.degraded,
      latencyMs: r.latencyMs,
      at: r.createdAt,
    })),
  });
}
