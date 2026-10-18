import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import os from "os";

// Global in-memory cache to ensure uploaded files persist across requests in a session
// even on read-only serverless filesystems (e.g., Vercel) until the instance/session terminates.
type FileEntry = { buf: Buffer; mime: string; savedAt: number };
const globalStore = globalThis as unknown as {
  __ojasvini_memory_storage?: Map<string, FileEntry>;
};

if (!globalStore.__ojasvini_memory_storage) {
  globalStore.__ojasvini_memory_storage = new Map<string, FileEntry>();
}

const memoryStore = globalStore.__ojasvini_memory_storage;

// Keep memory store bounded (up to 100 recent photos)
function pruneMemoryStore() {
  if (memoryStore.size > 100) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }
}

/**
 * Save an uploaded file reliably across environments (Local Dev, Docker, Vercel Serverless).
 * - Always caches in memory for immediate zero-latency retrieval in the current server instance.
 * - Writes to OS temp directory (always writable on Vercel: /tmp).
 * - Attempts to write to public/uploads (local dev), safely ignoring read-only filesystem errors.
 */
export async function saveUploadedFile(name: string, buf: Buffer, mime = "image/jpeg"): Promise<string> {
  // 1. Cache in memory
  pruneMemoryStore();
  memoryStore.set(name, { buf, mime, savedAt: Date.now() });

  // 2. Persist to OS temp directory (always writable on Linux/Vercel/Windows)
  try {
    const tmpDir = join(os.tmpdir(), "ojasvini_uploads");
    await mkdir(tmpDir, { recursive: true });
    await writeFile(join(tmpDir, name), buf);
  } catch (err) {
    console.warn("[storage] Warning: Failed to write to tmpdir:", err);
  }

  // 3. Persist to public/uploads if writable (local dev)
  try {
    const publicDir = join(process.cwd(), "public", "uploads");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, name), buf);
  } catch {
    // Expected on Vercel (read-only file system); silently ignore
  }

  return `/uploads/${name}`;
}

/**
 * Retrieve an uploaded file by filename from memory, temp dir, or public/uploads.
 */
export async function getUploadedFile(name: string): Promise<{ buf: Buffer; mime: string } | null> {
  // 1. Check memory store
  const inMemory = memoryStore.get(name);
  if (inMemory) {
    return { buf: inMemory.buf, mime: inMemory.mime };
  }

  // 2. Check OS temp directory
  try {
    const tmpPath = join(os.tmpdir(), "ojasvini_uploads", name);
    if (existsSync(tmpPath)) {
      const buf = await readFile(tmpPath);
      const ext = name.split(".").pop()?.toLowerCase();
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
      memoryStore.set(name, { buf, mime, savedAt: Date.now() });
      return { buf, mime };
    }
  } catch {}

  // 3. Check public/uploads
  try {
    const publicPath = join(process.cwd(), "public", "uploads", name);
    if (existsSync(publicPath)) {
      const buf = await readFile(publicPath);
      const ext = name.split(".").pop()?.toLowerCase();
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
      memoryStore.set(name, { buf, mime, savedAt: Date.now() });
      return { buf, mime };
    }
  } catch {}

  return null;
}
