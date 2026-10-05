import { describe, expect, it } from "vitest";
import { mockListing } from "@/lib/ai/client";

describe("mockListing (deterministic demo AI)", () => {
  it("builds a Hindi achaar listing with a market band", () => {
    const d = mockListing({ transcript: "Ghar ka aam ka achaar", imageUrls: [], locale: "hi", region: "Maharashtra, India" });
    expect(d.title).toBe("घर का आम का अचार");
    expect(d.category).toBe("food");
    expect(d.suggestedPrice.recommended).toBe(150);
    expect(d.suggestedPrice.min).toBeLessThanOrEqual(150);
    expect(d.suggestedPrice.max).toBeGreaterThanOrEqual(150);
  });
  it("builds the Marathi variant for the same product", () => {
    const d = mockListing({ transcript: "Ghar ka aam ka achaar", imageUrls: [], locale: "mr", region: "Maharashtra, India" });
    expect(d.title).toBe("घरचा आंब्याचा लोणचं");
    expect(d.suggestedPrice.recommended).toBe(150);
  });
  it("falls back to the spoken words for unknown products", () => {
    const d = mockListing({ transcript: "Bamboo tokri", imageUrls: [], locale: "hi", region: "Maharashtra, India" });
    expect(d.title).toContain("Bamboo tokri");
  });
  it("never fabricates banned claims", () => {
    const d = mockListing({ transcript: "organic FSSAI honey", imageUrls: [], locale: "en", region: "" });
    expect(d.title + d.description).not.toMatch(/organic|FSSAI/i);
  });
});
