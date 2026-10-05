import { createHash } from "crypto";
import { db } from "@/lib/db";

/** Stable stringify so equivalent inputs hash identically. */
function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "";
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`).join(",")}}`;
}

export function cacheKey(kind: string, parts: unknown): string {
  return `${kind}:${createHash("sha256").update(stable(parts)).digest("hex").slice(0, 32)}`;
}

export async function cacheGet<T>(kind: string, parts: unknown): Promise<T | null> {
  try {
    const row = await db.aiCache.findUnique({ where: { key: cacheKey(kind, parts) } });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await db.aiCache.delete({ where: { key: row.key } }).catch(() => {});
      return null;
    }
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(kind: string, parts: unknown, value: unknown, ttlMs: number): Promise<void> {
  try {
    const key = cacheKey(kind, parts);
    await db.aiCache.upsert({
      where: { key },
      update: { value: JSON.stringify(value), expiresAt: new Date(Date.now() + ttlMs) },
      create: { key, kind, value: JSON.stringify(value), expiresAt: new Date(Date.now() + ttlMs) },
    });
  } catch (e) {
    console.error("[ai] cache set failed", e);
  }
}
