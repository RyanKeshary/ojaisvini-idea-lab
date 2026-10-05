"use client";
import { IdbOutboxStorage } from "@/lib/offline/store";
import { MAX_RETRIES, backoffMs, newItem, type OutboxItem, type OutboxStorage, type OutboxType } from "@/lib/offline/outbox";

let storage: OutboxStorage = new IdbOutboxStorage();
let flushing = false;
const listeners = new Set<(count: number) => void>();

/** Test seam: swap storage (memory in unit tests). */
export function setOutboxStorage(s: OutboxStorage): void {
  storage = s;
}

async function emit() {
  try {
    const items = await storage.list();
    const n = items.filter((i) => i.status === "QUEUED" || i.status === "FAILED").length;
    listeners.forEach((fn) => fn(n));
  } catch {}
}

export function onOutboxCount(fn: (count: number) => void): () => void {
  listeners.add(fn);
  void emit();
  return () => {
    listeners.delete(fn);
  };
}

export async function queueWrite(type: OutboxType, payload: Record<string, unknown>): Promise<OutboxItem> {
  const item = newItem(type, payload);
  await storage.add(item);
  await emit();
  // Nudge Background Sync where supported; client flush covers the rest.
  try {
    const reg = await navigator.serviceWorker?.ready;
    await (reg as unknown as { sync?: { register: (t: string) => Promise<void> } })?.sync?.register("ojas-outbox");
  } catch {}
  return item;
}

async function uploadBlob(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("photo", blob, "photo.jpg");
  const r = await fetch("/api/upload", { method: "POST", body: form });
  const j = (await r.json()) as { ok?: boolean; url?: string };
  if (!r.ok || !j.url) throw new Error("upload-failed");
  return j.url;
}

async function flushOne(item: OutboxItem): Promise<void> {
  const p = item.payload;
  if (item.type === "product-publish") {
    const photos = p.photos as Blob[];
    const urls: string[] = [];
    for (const b of photos) urls.push(await uploadBlob(b instanceof Blob ? b : new Blob([b])));
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ draft: p.draft, priceINR: p.priceINR, stock: p.stock, imageUrls: urls, fulfillment: p.fulfillment }),
    });
    if (!r.ok) throw new Error(`publish-${r.status}`);
  } else if (item.type === "order-advance") {
    const r = await fetch(`/api/orders/${p.orderId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: p.to }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; code?: string };
    // Server-authoritative: bad transitions fail fast, never retried.
    if (!r.ok && (j.code === "bad-transition" || j.code === "forbidden")) {
      throw new Error(`final:${j.code}`);
    }
    if (!r.ok) throw new Error(`advance-${r.status}`);
  } else if (item.type === "post-create") {
    const r = await fetch("/api/community", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room: p.room, type: p.ctype, text: p.text, imageUrl: p.imageUrl, audioUrl: p.audioUrl, anon: p.anon }),
    });
    if (!r.ok) throw new Error(`post-${r.status}`);
  } else if (item.type === "reply-create") {
    const r = await fetch(`/api/community/${p.postId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: p.text }),
    });
    if (!r.ok) throw new Error(`reply-${r.status}`);
  }
}

/**
 * Flush the queue oldest-first. Returns {synced, failed}.
 * Final errors (bad-transition/forbidden) go straight to FAILED.
 */
export async function flushOutbox(): Promise<{ synced: number; failed: number }> {
  if (flushing) return { synced: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { synced: 0, failed: 0 };
  flushing = true;
  let synced = 0;
  let failed = 0;
  try {
    const items = await storage.list();
    for (const item of items) {
      if (item.status !== "QUEUED" && item.status !== "FAILED") continue;
      if (item.status === "FAILED" && item.retries >= MAX_RETRIES) continue;
      await storage.update(item.id, { status: "SYNCING" });
      try {
        await flushOne(item);
        await storage.remove(item.id);
        synced++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "sync-failed";
        const final = msg.startsWith("final:") || item.retries + 1 >= MAX_RETRIES;
        await storage.update(item.id, {
          status: final ? "FAILED" : "QUEUED",
          retries: item.retries + 1,
          error: msg,
        });
        if (final) failed++;
        // Backoff before the next item only on transient errors.
        if (!final) await new Promise((r) => setTimeout(r, backoffMs(item.retries)));
      }
    }
  } finally {
    flushing = false;
    await emit();
  }
  return { synced, failed };
}
