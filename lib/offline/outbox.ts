/**
 * Offline outbox core. Storage-agnostic: IndexedDB in the browser (idb),
 * in-memory in unit tests. Queued writes flush with backoff; server stays
 * authoritative for orders (invalid transitions fail fast, no infinite retry).
 */

export type OutboxType = "product-publish" | "order-advance" | "post-create" | "reply-create";

export type OutboxItem = {
  id: string;
  type: OutboxType;
  // JSON-safe except product-publish.photos which may hold Blobs (IDB only).
  payload: Record<string, unknown>;
  createdAt: number;
  status: "QUEUED" | "SYNCING" | "DONE" | "FAILED";
  retries: number;
  error?: string;
};

export interface OutboxStorage {
  add(item: OutboxItem): Promise<void>;
  list(): Promise<OutboxItem[]>;
  update(id: string, patch: Partial<OutboxItem>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function newItem(type: OutboxType, payload: Record<string, unknown>): OutboxItem {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return { id, type, payload, createdAt: Date.now(), status: "QUEUED", retries: 0 };
}

export class MemoryOutboxStorage implements OutboxStorage {
  private items = new Map<string, OutboxItem>();
  async add(item: OutboxItem): Promise<void> {
    this.items.set(item.id, { ...item });
  }
  async list(): Promise<OutboxItem[]> {
    return [...this.items.values()].sort((a, b) => a.createdAt - b.createdAt);
  }
  async update(id: string, patch: Partial<OutboxItem>): Promise<void> {
    const cur = this.items.get(id);
    if (cur) this.items.set(id, { ...cur, ...patch });
  }
  async remove(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export const MAX_RETRIES = 5;

export function backoffMs(retries: number): number {
  return Math.min(60000, 2000 * 2 ** retries);
}
