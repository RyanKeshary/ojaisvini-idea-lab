import { z } from "zod";

/** Strict contract for vision → listing output (Section 7.5). */
export const listingSchema = z.object({
  title: z.string().min(2).max(60),
  description: z.string().min(2).max(240),
  category: z.enum(["food", "tailoring", "handicraft", "farm", "home-service", "other"]),
  tags: z.array(z.string()).max(8).default([]),
  attributes: z
    .object({
      weight: z.string().optional().default(""),
      ingredients: z.array(z.string()).optional().default([]),
      material: z.string().optional().default(""),
      shelfLife: z.string().optional().default(""),
    })
    .default({ weight: "", ingredients: [], material: "", shelfLife: "" }),
  suggestedPrice: z.object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    recommended: z.number().int().nonnegative(),
    reason: z.string().max(240),
  }),
  photoQuality: z.object({
    score: z.number().min(0).max(1),
    issues: z.array(z.enum(["dark", "blurry", "cluttered"])).default([]),
    tips: z.array(z.string()).default([]),
  }),
  safetyNotes: z.array(z.string()).default([]),
});

export type ListingDraft = z.infer<typeof listingSchema>;

/** Banned claims: never fabricate unless the seller confirmed them. */
export const BANNED_CLAIMS = ["organic", "FSSAI", "certified", "ISO", "AGMARK"] as const;
