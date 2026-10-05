import { describe, expect, it } from "vitest";
import { MemoryOutboxStorage, backoffMs, newItem, MAX_RETRIES } from "@/lib/offline/outbox";
import { flushOutbox } from "@/lib/offline/sync";
import { setOutboxStorage } from "@/lib/offline/sync";

describe("outbox core", () => {
  it("queues oldest-first with unique ids", async () => {
    const s = new MemoryOutboxStorage();
    const a = newItem("order-advance", { orderId: "1", to: "ACCEPTED" });
    await new Promise((r) => setTimeout(r, 2));
    const b = newItem("order-advance", { orderId: "2", to: "ACCEPTED" });
    expect(a.id).not.toBe(b.id);
    await s.add(b);
    await s.add(a);
    const list = await s.list();
    expect(list.map((i) => i.id)).toEqual([a.id, b.id]);
    expect(list[0].status).toBe("QUEUED");
    expect(list[0].retries).toBe(0);
  });
  it("backs off exponentially with a cap", () => {
    expect(backoffMs(0)).toBe(2000);
    expect(backoffMs(1)).toBe(4000);
    expect(backoffMs(10)).toBe(60000);
    expect(MAX_RETRIES).toBe(5);
  });
  it("flush is a safe no-op without a browser network stack", async () => {
    setOutboxStorage(new MemoryOutboxStorage());
    // No `navigator` in node: returns zeros, never throws.
    await expect(flushOutbox()).resolves.toEqual({ synced: 0, failed: 0 });
  });
});
