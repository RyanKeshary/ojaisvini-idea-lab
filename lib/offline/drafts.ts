"use client";
import { openDB, type DBSchema } from "idb";

export type CreateDraft = {
  transcript: string;
  photos: Blob[];
  step: number;
  savedAt: number;
};

interface DraftDB extends DBSchema {
  drafts: { key: string; value: CreateDraft };
}

let dbPromise: ReturnType<typeof openDB<DraftDB>> | null = null;

function db(): NonNullable<typeof dbPromise> {
  if (!dbPromise) {
    dbPromise = openDB<DraftDB>("ojas-drafts", 1, {
      upgrade(d) {
        d.createObjectStore("drafts");
      },
    });
  }
  return dbPromise;
}

const KEY = "create-v1";

/** Offline-tolerant draft: raw transcript + photo blobs (survives reload). */
export async function saveCreateDraft(draft: CreateDraft): Promise<void> {
  try {
    await (await db()).put("drafts", draft, KEY);
  } catch {}
}

export async function loadCreateDraft(): Promise<CreateDraft | null> {
  try {
    return (await (await db()).get("drafts", KEY)) || null;
  } catch {
    return null;
  }
}

export async function clearCreateDraft(): Promise<void> {
  try {
    await (await db()).delete("drafts", KEY);
  } catch {}
}
