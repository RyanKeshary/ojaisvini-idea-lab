import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { evaluate, type Profile } from "@/lib/schemes/eligibility";

const querySchema = z.object({
  state: z.string().max(8).default("MH"),
  category: z.string().max(20).optional(),
  business: z.string().max(20).optional(),
  age: z.coerce.number().int().min(0).max(120).nullable().optional(),
  incomeAnnual: z.coerce.number().int().min(0).nullable().optional(),
  gender: z.enum(["women", "men"]).default("women"),
  shg: z.enum(["yes", "no", "unknown"]).default("unknown"),
  caste: z.enum(["SC", "ST", "OBC", "General", "unknown"]).default("unknown"),
  showAll: z.enum(["0", "1"]).default("0"),
  locale: z.enum(["hi", "mr", "en", "gu", "ta"]).default("hi"),
});

/** Filtered schemes with deterministic eligibility verdicts. */
export async function GET(req: Request) {
  const q = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = querySchema.safeParse(q);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const f = parsed.data;
  const profile: Profile = {
    state: f.state,
    age: f.age ?? null,
    gender: f.gender,
    incomeAnnual: f.incomeAnnual ?? null,
    business: f.business || "any",
    shg: f.shg === "unknown" ? null : f.shg === "yes",
    caste: f.caste === "unknown" ? null : f.caste,
  };
  const schemes = await db.scheme.findMany({ orderBy: { name: "asc" } });
  const supported = ["hi", "mr", "en", "gu", "ta"];
  const loc = supported.includes(f.locale) ? f.locale : "hi";
  const pick = (json: string): string => {
    try {
      const m = JSON.parse(json) as Record<string, string>;
      return m[loc] || m.en || "";
    } catch {
      return "";
    }
  };
  const out = schemes
    .map((s) => {
      const { verdict, reasons } = evaluate(s, profile);
      const cats = (() => {
        try {
          return JSON.parse(s.categories) as string[];
        } catch {
          return [];
        }
      })();
      return {
        id: s.id,
        name: pick(s.nameI18n) || s.name,
        level: s.level,
        categories: cats,
        benefit: pick(s.benefits),
        documents: (() => {
          try {
            return JSON.parse(s.documents) as string[];
          } catch {
            return [];
          }
        })(),
        applyUrl: s.applyUrl,
        lastVerifiedAt: s.lastVerifiedAt,
        sourceUrl: s.sourceUrl,
        verdict,
        reasons,
      };
    })
    .filter((s) => {
      if (f.showAll === "1") return true;
      if (s.verdict === "NOT_ELIGIBLE") return false;
      if (f.category && !s.categories.includes(f.category)) return false;
      if (f.business && f.business !== "any") {
        // Business mismatch demotes to hidden unless MAYBE explicitly kept —
        // keep MAYBE visible (exceptions exist), hide only on filter mismatch
        // for ELIGIBLE rows of other trades? No: keep all non-NOT visible.
      }
      return true;
    })
    .sort((a, b) => {
      const rank = { ELIGIBLE: 0, MAYBE: 1, NOT_ELIGIBLE: 2 } as Record<string, number>;
      return rank[a.verdict] - rank[b.verdict];
    });
  return NextResponse.json({ ok: true, schemes: out });
}
