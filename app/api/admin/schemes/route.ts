import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

const schemeSchema = z.object({
  name: z.string().min(2).max(120),
  nameI18n: z.record(z.string(), z.string()).default({}),
  level: z.enum(["central", "state"]).default("central"),
  states: z.array(z.string()).default(["ALL"]),
  categories: z.array(z.string()).default(["loan"]),
  gender: z.array(z.string()).default(["women"]),
  ageMin: z.number().int().nullable().optional(),
  ageMax: z.number().int().nullable().optional(),
  incomeMax: z.number().int().nullable().optional(),
  occupations: z.array(z.string()).default(["entrepreneur"]),
  businessTypes: z.array(z.string()).default(["any"]),
  casteList: z.array(z.string()).default([]),
  shgOnly: z.boolean().default(false),
  benefits: z.record(z.string(), z.string()),
  documents: z.array(z.string()).default([]),
  applyUrl: z.string().max(300).nullable().optional(),
  sourceUrl: z.string().max(300).nullable().optional(),
});

function serialize(s: z.infer<typeof schemeSchema> & { lastVerifiedAt?: Date }) {
  return {
    name: s.name,
    nameI18n: JSON.stringify(s.nameI18n),
    level: s.level,
    states: JSON.stringify(s.states),
    categories: JSON.stringify(s.categories),
    gender: JSON.stringify(s.gender),
    ageMin: s.ageMin ?? null,
    ageMax: s.ageMax ?? null,
    incomeMax: s.incomeMax ?? null,
    occupations: JSON.stringify(s.occupations),
    businessTypes: JSON.stringify(s.businessTypes),
    casteList: JSON.stringify(s.casteList),
    shgOnly: s.shgOnly,
    benefits: JSON.stringify(s.benefits),
    documents: JSON.stringify(s.documents),
    applyUrl: s.applyUrl || null,
    sourceUrl: s.sourceUrl || null,
    lastVerifiedAt: s.lastVerifiedAt || new Date(),
  };
}

/** Create a scheme (verified data only; audited). */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = schemeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const created = await db.scheme.create({ data: serialize(parsed.data) });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "admin.scheme.create", meta: JSON.stringify({ id: created.id }) },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

/** Update a scheme (bumps lastVerifiedAt; audited). */
export async function PUT(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !isAdmin(role)) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = schemeSchema.extend({ id: z.string().min(1).max(64) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const { id, ...rest } = parsed.data;
  const existing = await db.scheme.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ code: "not-found" }, { status: 404 });
  await db.scheme.update({ where: { id }, data: serialize({ ...rest, lastVerifiedAt: new Date() }) });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "admin.scheme.update", meta: JSON.stringify({ id }) },
  });
  return NextResponse.json({ ok: true });
}
