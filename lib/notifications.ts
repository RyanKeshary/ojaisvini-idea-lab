import { inr } from "@/lib/utils";

export type Notification = {
  id: string;
  kind: string;
  payload: { orderId?: string; total?: number; net?: number; items?: number; buyer?: string };
  read: boolean;
  createdAt: string;
};

/** One plain line per notification, shared by the inbox and the sidebar nudge. */
export function describeNotification(n: Notification): string {
  if (n.kind === "new-order") {
    return `🧺 New order ${inr(n.payload.total || 0)}${n.payload.buyer ? ` — ${n.payload.buyer}` : ""}`;
  }
  if (n.kind === "payout-ready") {
    return `💰 Payout ready: ${inr(n.payload.net || 0)}`;
  }
  return `• ${n.kind}`;
}
