import { db } from "@/lib/db";

export const TICKET_TTL_MS = 10 * 60 * 1000;

/** Mint a single-use login ticket after OTP/PIN/staff verification. */
export async function issueTicket(userId: string): Promise<string> {
  await db.authTicket.deleteMany({ where: { userId } });
  const t = await db.authTicket.create({
    data: { userId, expiresAt: new Date(Date.now() + TICKET_TTL_MS) },
  });
  return t.id;
}

/** Redeem once. Returns the user or null. */
export async function redeemTicket(id: string) {
  const t = await db.authTicket.findUnique({ where: { id }, include: { user: true } });
  if (!t) return null;
  await db.authTicket.delete({ where: { id } }).catch(() => {});
  if (t.expiresAt.getTime() < Date.now()) return null;
  if (t.user.deletedAt) return null;
  return t.user;
}
