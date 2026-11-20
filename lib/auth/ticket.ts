import { db } from "@/lib/db";

export const TICKET_TTL_MS = 10 * 60 * 1000;

/** Mint a single-use login ticket after OTP/PIN/staff verification. */
export async function issueTicket(userId: string): Promise<string> {
  try {
    await db.authTicket.deleteMany({ where: { userId } });
    const t = await db.authTicket.create({
      data: { userId, expiresAt: new Date(Date.now() + TICKET_TTL_MS) },
    });
    return t.id;
  } catch {
    const { supabaseRest } = await import("@/lib/supabase-rest");
    return await supabaseRest.createTicket(userId, new Date(Date.now() + TICKET_TTL_MS));
  }
}

/** Redeem once. Returns the user or null. */
export async function redeemTicket(id: string) {
  try {
    const t = await db.authTicket.findUnique({ where: { id }, include: { user: true } });
    if (t) {
      await db.authTicket.delete({ where: { id } }).catch(() => {});
      if (t.expiresAt.getTime() < Date.now()) return null;
      if (t.user.deletedAt) return null;
      return t.user;
    }
  } catch {
    // Fall back to REST below
  }

  const { supabaseRest } = await import("@/lib/supabase-rest");
  return await supabaseRest.redeemTicket(id);
}
