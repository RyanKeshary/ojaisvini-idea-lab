import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

/** Full localized scheme detail + my saved/checklist state. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const { id } = await params;
  const s = await db.scheme.findUnique({ where: { id } });
  if (!s) return NextResponse.json({ code: "not-found" }, { status: 404 });
  const saved = await db.savedScheme.findUnique({
    where: { userId_schemeId: { userId: session.user.id, schemeId: s.id } },
  });
  return NextResponse.json({
    ok: true,
    scheme: {
      id: s.id,
      name: s.name,
      nameI18n: JSON.parse(s.nameI18n || "{}"),
      level: s.level,
      states: JSON.parse(s.states || "[]"),
      categories: JSON.parse(s.categories || "[]"),
      benefits: JSON.parse(s.benefits || "{}"),
      documents: JSON.parse(s.documents || "[]"),
      applyUrl: s.applyUrl,
      sourceUrl: s.sourceUrl,
      lastVerifiedAt: s.lastVerifiedAt,
    },
    saved: !!saved,
    checklist: saved ? JSON.parse(saved.checklistState || "{}") : {},
  });
}
