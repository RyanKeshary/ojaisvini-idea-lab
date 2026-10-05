import { describe, expect, it } from "vitest";
import { luhnValid, validUpiId } from "@/lib/payments/luhn";
import { signWebhook, verifyWebhook } from "@/lib/payments/hmac";
import { allowedTransitions } from "@/lib/orders/service";

describe("demo payment validation", () => {
  it("accepts the documented test cards via Luhn", () => {
    expect(luhnValid("4111 1111 1111 1111")).toBe(true);
    expect(luhnValid("4000 0000 0000 0002")).toBe(true);
    expect(luhnValid("1234 5678 9012 3456")).toBe(false);
    expect(luhnValid("123")).toBe(false);
  });
  it("validates UPI ids", () => {
    expect(validUpiId("sunita@okbank")).toBe(true);
    expect(validUpiId("not-an-upi")).toBe(false);
    expect(validUpiId("a@b")).toBe(false);
  });
  it("signs and verifies webhooks, rejects forgeries", () => {
    const sig = signWebhook("pay_123");
    expect(verifyWebhook("pay_123", sig)).toBe(true);
    expect(verifyWebhook("pay_124", sig)).toBe(false);
    expect(verifyWebhook("pay_123", "deadbeef")).toBe(false);
  });
});

describe("order state machine", () => {
  it("allows only the seller edges", () => {
    expect(allowedTransitions("PLACED")).toEqual(["ACCEPTED", "CANCELLED"]);
    expect(allowedTransitions("READY")).toEqual(["PICKED_UP"]);
    expect(allowedTransitions("DELIVERED")).toEqual([]);
    expect(allowedTransitions("NOPE")).toEqual([]);
  });
});
