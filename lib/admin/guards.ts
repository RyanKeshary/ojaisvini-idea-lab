import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";

/** Server helper: is a feature flag on? Absent = on. */
export async function flagOn(key: string): Promise<boolean> {
  try {
    const f = await db.featureFlag.findUnique({ where: { key } });
    return !f || f.value !== "0";
  } catch {
    return true;
  }
}

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "ADMIN") return null;
  return session;
}
