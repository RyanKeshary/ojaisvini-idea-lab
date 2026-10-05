"use client";
import { openDB, type DBSchema } from "idb";
import type { OutboxItem, OutboxStorage } from "@/lib/offline/outbox";

interface OjasDB extends DBSchema {
  outbox: { key: string; value: OutboxItem; indexes: { "by-status": string } };
}

let dbPromise: ReturnType<typeof openDB<OjasDB>> | null = null;

function db(): NonNullable<typeof dbPromise> {
  if (!dbPromise) {
    dbPromise = openDB<OjasDB>("ojas", 1, {
      upgrade(d) {
        const store = d.createObjectStore("outbox", { keyPath: "id" });
        store.createIndex("by-status", "status");
      },
    });
  }
  return dbPromise;
}

/** IndexedDB-backed outbox storage (photos as Blobs survive here). */
export class IdbOutboxStorage implements OutboxStorage {
  async add(item: OutboxItem): Promise<void> {
    await (await db()).put("outbox", { ...item });
  }
  async list(): Promise<OutboxItem[]> {
    const all = await (await db()).getAll("outbox");
    return all.sort((a, b) => a.createdAt - b.createdAt);
  }
  async update(id: string, patch: Partial<OutboxItem>): Promise<void> {
    const d = await db();
    const cur = await d.get("outbox", id);
    if (cur) await d.put("outbox", { ...cur, ...patch });
  }
  async remove(id: string): Promise<void> {
    await (await db()).delete("outbox", id);
  }
}
