import { describe, expect, it } from "vitest";
import { resolveIntent } from "@/lib/ai/intent";
import { splitAction, mockReply } from "@/lib/ai/prompts/assistant";
import { cacheKey } from "@/lib/ai/cache";

describe("resolveIntent (rule-first)", () => {
  it("resolves price/confirm/reject from rules without network", async () => {
    expect(await resolveIntent("daam 150 rakho")).toEqual({
      intent: { intent: "set_price", value: 150 },
      source: "rule",
    });
    expect(await resolveIntent("haan")).toEqual({ intent: { intent: "confirm" }, source: "rule" });
    expect(await resolveIntent("dobara bolo")).toEqual({ intent: { intent: "reject" }, source: "rule" });
    expect(await resolveIntent("padho")).toEqual({ intent: { intent: "help" }, source: "rule" });
  });
  it("returns unknown (mock source) when rules have low confidence", async () => {
    // Default AI_PROVIDER=mock: no network, deterministic unknown.
    expect(await resolveIntent("neele aasmaan mein badal")).toEqual({
      intent: { intent: "unknown" },
      source: "mock",
    });
  });
});

describe("cacheKey", () => {
  it("is stable across key order and distinct across inputs", () => {
    const a = cacheKey("listing", { transcript: "x", locale: "hi" });
    const b = cacheKey("listing", { locale: "hi", transcript: "x" });
    const c = cacheKey("listing", { transcript: "y", locale: "hi" });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("assistant actions + mock replies", () => {
  it("splits a trailing ACTION line, rejects unknown actions", () => {
    expect(splitAction("Try this\nACTION:open-lesson|upi-1")).toEqual({
      text: "Try this",
      action: { name: "open-lesson", value: "upi-1" },
    });
    expect(splitAction("Hello").action).toBeUndefined();
    expect(splitAction("Hi\nACTION:rm-rf|/").action).toBeUndefined();
  });
  it("mock replies stay in-locale and ground earnings", () => {
    const ctx = "Shops: Meri Dukaan\nLast 30 days: 3 orders, 2 paid, revenue ₹450.";
    const hi = mockReply("meri kamai kitni hui?", ctx, "hi");
    expect(hi.reply).toContain("₹450");
    expect(hi.action?.name).toBe("show-earnings");
    const mr = mockReply("photo kashi kadhu?", ctx, "mr");
    expect(mr.action).toEqual({ name: "open-lesson", value: "photo-1" });
  });
});
