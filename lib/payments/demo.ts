/**
 * PaymentProvider abstraction. DemoGateway simulates a full gateway lifecycle
 * locally — no real money ever moves. A real provider (Razorpay/Stripe) plugs
 * in here later behind the same interface.
 */

export type PayMethod = "UPI" | "CARD" | "NETBANKING" | "COD";

export type AttemptInput =
  | { method: "UPI"; upiId: string }
  | { method: "CARD"; cardNumber: string; expiry: string; cvv: string; name: string; otp?: string }
  | { method: "NETBANKING"; bank: string }
  | { method: "COD" };

export type AttemptResult =
  | { outcome: "success"; providerRef: string }
  | { outcome: "pending-otp"; providerRef: string }
  | { outcome: "failed"; reason: string };

export interface PaymentProvider {
  readonly name: string;
  attempt(amountPaise: number, input: AttemptInput): Promise<AttemptResult>;
  verifyCardOtp(providerRef: string, otp: string): Promise<AttemptResult>;
  refund(providerRef: string, amountPaise: number): Promise<{ ok: boolean; refundRef: string }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Demo test cards (documented in README + checkout UI). */
export const DEMO_CARDS = {
  success: "4111 1111 1111 1111",
  declined: "4000 0000 0000 0002",
  insufficient: "4000 0000 0000 9995",
  cardOtp: "123456",
} as const;

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

class DemoGateway implements PaymentProvider {
  readonly name = "demo";

  async attempt(amountPaise: number, input: AttemptInput): Promise<AttemptResult> {
    void amountPaise;
    // Simulated network/processing latency so the UI waiting states are real.
    await sleep(1200);
    const ref = `demo_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    switch (input.method) {
      case "UPI":
        return { outcome: "success", providerRef: ref };
      case "NETBANKING":
        return Math.random() < 0.9
          ? { outcome: "success", providerRef: ref }
          : { outcome: "failed", reason: "Bank ne payment nahi liya. Dobara try karein." };
      case "COD":
        return { outcome: "success", providerRef: ref };
      case "CARD": {
        const num = digits(input.cardNumber);
        if (num === digits(DEMO_CARDS.declined)) {
          return { outcome: "failed", reason: "Card declined by bank (demo)." };
        }
        if (num === digits(DEMO_CARDS.insufficient)) {
          return { outcome: "failed", reason: "Insufficient funds (demo)." };
        }
        // All other Luhn-valid cards (incl. the success test card) go to OTP.
        return { outcome: "pending-otp", providerRef: ref };
      }
    }
  }

  async verifyCardOtp(providerRef: string, otp: string): Promise<AttemptResult> {
    await sleep(800);
    if (otp === DEMO_CARDS.cardOtp) return { outcome: "success", providerRef };
    return { outcome: "failed", reason: "OTP galat hai. Demo OTP 123456 hai." };
  }

  async refund(providerRef: string, amountPaise: number): Promise<{ ok: boolean; refundRef: string }> {
    void providerRef;
    void amountPaise;
    await sleep(800);
    return { ok: true, refundRef: `ref_${Date.now().toString(36)}` };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new DemoGateway();
}
