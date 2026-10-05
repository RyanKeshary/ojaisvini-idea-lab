import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret";
}

/** Sign internal demo-webhook payloads (proves the callback came from us). */
export function signWebhook(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyWebhook(payload: string, signature: string): boolean {
  const a = Buffer.from(signWebhook(payload));
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
