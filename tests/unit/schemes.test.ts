import { describe, expect, it } from "vitest";
import { evaluate, type SchemeRow } from "@/lib/schemes/eligibility";

const base: SchemeRow = {
  states: JSON.stringify(["MH"]),
  categories: JSON.stringify(["loan"]),
  gender: JSON.stringify(["women"]),
  ageMin: 18,
  ageMax: 60,
  incomeMax: null,
  occupations: JSON.stringify(["entrepreneur"]),
  businessTypes: JSON.stringify(["food"]),
  casteList: JSON.stringify([]),
  shgOnly: false,
};

const profile = {
  state: "MH",
  age: 38,
  gender: "women",
  incomeAnnual: 200000,
  business: "food",
  shg: null as boolean | null,
  caste: null as string | null,
};

describe("eligibility engine (deterministic, never LLM)", () => {
  it("marks a full match ELIGIBLE", () => {
    expect(evaluate(base, profile).verdict).toBe("ELIGIBLE");
  });
  it("hard-rejects wrong state, gender, age", () => {
    expect(evaluate(base, { ...profile, state: "GJ" }).verdict).toBe("NOT_ELIGIBLE");
    expect(evaluate(base, { ...profile, gender: "men" }).verdict).toBe("NOT_ELIGIBLE");
    expect(evaluate(base, { ...profile, age: 17 }).verdict).toBe("NOT_ELIGIBLE");
  });
  it("soft-flags business/SHG mismatch as MAYBE with reasons", () => {
    const r = evaluate(base, { ...profile, business: "vendor" });
    expect(r.verdict).toBe("MAYBE");
    expect(r.reasons.map((x) => x.code)).toContain("business");
    const s = evaluate({ ...base, shgOnly: true }, { ...profile, shg: false });
    expect(s.verdict).toBe("MAYBE");
    expect(s.reasons.map((x) => x.code)).toContain("shg");
  });
  it("enforces reserved caste strictly, asks when unknown", () => {
    const sc = { ...base, casteList: JSON.stringify(["SC"]) };
    expect(evaluate(sc, { ...profile, caste: "OBC" }).verdict).toBe("NOT_ELIGIBLE");
    expect(evaluate(sc, { ...profile, caste: null }).verdict).toBe("MAYBE");
    expect(evaluate(sc, { ...profile, caste: "SC" }).verdict).toBe("ELIGIBLE");
  });
  it("enforces income caps", () => {
    const capped = { ...base, incomeMax: 300000 };
    expect(evaluate(capped, { ...profile, incomeAnnual: 500000 }).verdict).toBe("NOT_ELIGIBLE");
    expect(evaluate(capped, { ...profile, incomeAnnual: null }).verdict).toBe("MAYBE");
  });
});
