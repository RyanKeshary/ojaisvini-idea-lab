import { describe, expect, it } from "vitest";
import { stripPhones, precheck } from "@/lib/community/moderate";

describe("community safety (mock screen)", () => {
  it("masks phone numbers before they go public", () => {
    expect(stripPhones("Call me 9876543210 please")).toBe("Call me •••••• please");
    expect(stripPhones("Call +91 98765 43210")).toBe("Call ••••••");
    expect(stripPhones("No numbers here")).toBe("No numbers here");
  });
  it("flags scams and abuse, passes normal posts", async () => {
    const scam = await precheck("You won a lottery! Double your money, pay fee to unlock.");
    expect(scam.flagged).toBe(true);
    expect(scam.reasons).toContain("scam");
    const abuse = await precheck("You are stupid, shut up.");
    expect(abuse.flagged).toBe(true);
    const ok = await precheck("Achaar mein tel kitna daalein?");
    expect(ok).toEqual({ flagged: false, reasons: [] });
  });
});
