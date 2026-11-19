"use server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { hashPin } from "@/lib/auth/pin";
import { registerNameSchema } from "@/lib/validation/auth";

const pinSchema = z.string().regex(/^\d{4}$/);

/** Authenticated: set/confirm the voice name given at registration. */
export async function updateMyName(name: string, phoneFallback?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const parsed = registerNameSchema.safeParse({ name });
    if (!parsed.success) return { ok: false, error: "invalid-name" };

    const session = await auth();
    let userId = session?.user?.id;

    if (!userId && phoneFallback) {
      const u = await db.user.findUnique({ where: { phone: phoneFallback } });
      if (u && !u.deletedAt) userId = u.id;
    }

    if (!userId) return { ok: false, error: "no-account" };
    await db.user.update({ where: { id: userId }, data: { name: parsed.data.name } });
    return { ok: true };
  } catch (err) {
    console.error("updateMyName error:", err);
    return { ok: false, error: "something-wrong" };
  }
}

/** Authenticated: set (or change) the 4-digit PIN. */
export async function setMyPin(pin: string, phoneFallback?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!pinSchema.safeParse(pin).success) return { ok: false, error: "invalid-pin" };

    const session = await auth();
    let userId = session?.user?.id;

    if (!userId && phoneFallback) {
      const u = await db.user.findUnique({ where: { phone: phoneFallback } });
      if (u && !u.deletedAt) userId = u.id;
    }

    if (!userId) return { ok: false, error: "no-account" };
    await db.user.update({
      where: { id: userId },
      data: { pinHash: await hashPin(pin), pinFails: 0, pinLockedUntil: null },
    });
    await db.auditLog.create({ data: { actorId: userId, action: "pin.changed", meta: "{}" } });
    return { ok: true };
  } catch (err) {
    console.error("setMyPin error:", err);
    return { ok: false, error: "something-wrong" };
  }
}

/** Authenticated: soft-delete my account and content visibility. */
export async function deleteMyAccount(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await db.user.update({ where: { id: session.user.id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { actorId: session.user.id, action: "user.deleted", meta: "{}" } });
  return { ok: true };
}
