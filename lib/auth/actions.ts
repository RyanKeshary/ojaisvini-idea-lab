"use server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { hashPin } from "@/lib/auth/pin";
import { registerNameSchema } from "@/lib/validation/auth";

const pinSchema = z.string().regex(/^\d{4}$/);

/** Authenticated: set/confirm the voice name given at registration. */
export async function updateMyName(name: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "no-account" };
  const parsed = registerNameSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: "invalid-name" };
  await db.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  return { ok: true };
}

/** Authenticated: set (or change) the 4-digit PIN. */
export async function setMyPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "no-account" };
  if (!pinSchema.safeParse(pin).success) return { ok: false, error: "invalid-pin" };
  await db.user.update({
    where: { id: session.user.id },
    data: { pinHash: await hashPin(pin), pinFails: 0, pinLockedUntil: null },
  });
  await db.auditLog.create({ data: { actorId: session.user.id, action: "pin.changed", meta: "{}" } });
  return { ok: true };
}

/** Authenticated: soft-delete my account and content visibility. */
export async function deleteMyAccount(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await db.user.update({ where: { id: session.user.id }, data: { deletedAt: new Date() } });
  await db.auditLog.create({ data: { actorId: session.user.id, action: "user.deleted", meta: "{}" } });
  return { ok: true };
}
