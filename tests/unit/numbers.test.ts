import { describe, expect, it } from "vitest";
import { parseIndicNumber } from "@/lib/voice/numbers";

describe("parseIndicNumber", () => {
  it("prefers trailing digits (price position)", () => {
    expect(parseIndicNumber("daam 150 rakho")).toBe(150);
    expect(parseIndicNumber("kimmat ₹1,250")).toBe(1250);
  });
  it("parses Hindi words", () => {
    expect(parseIndicNumber("ek sau pachaas")).toBe(150);
    expect(parseIndicNumber("do sau")).toBe(200);
    expect(parseIndicNumber("dedh sau")).toBe(150);
    expect(parseIndicNumber("hazaar")).toBe(1000);
  });
  it("parses Marathi words", () => {
    expect(parseIndicNumber("shambhar")).toBe(100);
    expect(parseIndicNumber("donashe")).toBeNull();
    expect(parseIndicNumber("pannas")).toBe(50);
  });
  it("parses Gujarati and Tamil words", () => {
    expect(parseIndicNumber("be so pachaas")).toBe(250);
    expect(parseIndicNumber("nooru")).toBe(100);
    expect(parseIndicNumber("iru nooru")).toBe(200);
    expect(parseIndicNumber("onbadhu")).toBe(9);
    expect(parseIndicNumber("tran hajaar")).toBe(3000);
  });
  it("returns null for non-numeric speech", () => {
    expect(parseIndicNumber("haan publish karo")).toBeNull();
    expect(parseIndicNumber("dobara bolo")).toBeNull();
  });
});
