import { describe, expect, it } from "vitest";
import { parseReviewCommand } from "@/lib/voice/commands";

describe("parseReviewCommand", () => {
  it("sets price from digits and words", () => {
    expect(parseReviewCommand("daam 150 rakho")).toEqual({ kind: "SET_PRICE", price: 150 });
    expect(parseReviewCommand("kimmat ek sau pachaas")).toEqual({ kind: "SET_PRICE", price: 150 });
  });
  it("publishes on bare yes", () => {
    expect(parseReviewCommand("haan")).toEqual({ kind: "PUBLISH" });
    expect(parseReviewCommand("ho, publish kara")).toEqual({ kind: "PUBLISH" });
  });
  it("re-records and reads", () => {
    expect(parseReviewCommand("dobara bolo")).toEqual({ kind: "RERECORD" });
    expect(parseReviewCommand("padho")).toEqual({ kind: "READ" });
  });
  it("falls back to unknown", () => {
    expect(parseReviewCommand("namaste didi")).toEqual({ kind: "UNKNOWN", text: "namaste didi" });
  });
});
