import { readFile } from "fs/promises";
import { join } from "path";
import { listingPrompt } from "@/lib/ai/prompts/listing";
import { listingSchema, BANNED_CLAIMS, type ListingDraft } from "@/lib/ai/schema";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { cacheGet, cacheSet } from "@/lib/ai/cache";
import type { Locale } from "@/lib/i18n/config";

const LISTING_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type GenerateInput = {
  transcript: string;
  imageUrls: string[]; // local /uploads/* paths
  locale: Locale;
  region: string;
  userId?: string;
};

function stripBannedClaims(d: ListingDraft): ListingDraft {
  const rx = new RegExp(BANNED_CLAIMS.join("|"), "gi");
  const clean = (s: string) => s.replace(rx, "").replace(/\s{2,}/g, " ").trim();
  return { ...d, title: clean(d.title) || d.title, description: clean(d.description) || d.description };
}

/** Deterministic mock keyed by product keyword — full demo works with no key. */
export function mockListing(input: GenerateInput): ListingDraft {
  const t = input.transcript.toLowerCase();
  const mr = input.locale === "mr";
  const hi = input.locale === "hi";
  const pick = (m: string, h: string, e: string) => (mr ? m : hi ? h : e);

  if (/achar|achaar|pickle|lonch|लोणच|अचार/.test(t)) {
    return stripBannedClaims(
      listingSchema.parse({
        title: pick("घरचा आंब्याचा लोणचं", "घर का आम का अचार", "Homemade mango pickle"),
        description: pick(
          "घरगुती कैरी, तेल-मसाला. चव गावासारखी.",
          "घर की कैरी, तेल-मसाला. गाँव जैसा स्वाद.",
          "Home mango, oil-spice mix. Village-style taste."
        ),
        category: "food",
        tags: ["achar", "homemade"],
        attributes: { weight: "250g", ingredients: [], material: "", shelfLife: "3 months" },
        suggestedPrice: {
          min: 120,
          max: 160,
          recommended: 150,
          reason: pick(
            "आसपास 250g ₹120–₹160",
            "आस-पास 250g ₹120–₹160",
            "Nearby 250g sells ₹120–₹160",
          ),
        },
        photoQuality: { score: 0.8, issues: [], tips: [] },
        safetyNotes: [],
      })
    );
  }
  if (/papad|पापड|पापड़/.test(t)) {
    return stripBannedClaims(
      listingSchema.parse({
        title: pick("घरचे उडदाचे पापड", "घर के उड़द के पापड़", "Homemade urad papad"),
        description: pick("उन्हात वाळवलेले, कुरकुरीत.", "धूप में सुखाए, कुरकुरे.", "Sun-dried, crisp."),
        category: "food",
        tags: ["papad", "homemade"],
        attributes: { weight: "500g", ingredients: [], material: "", shelfLife: "6 months" },
        suggestedPrice: { min: 100, max: 140, recommended: 120, reason: pick("आसपास 500g ₹100–₹140", "आस-पास 500g ₹100–₹140", "Nearby 500g sells ₹100–₹140") },
        photoQuality: { score: 0.8, issues: [], tips: [] },
        safetyNotes: [],
      })
    );
  }
  const words = input.transcript.trim().slice(0, 40) || pick("नवीन सामान", "नया सामान", "New product");
  return stripBannedClaims(
    listingSchema.parse({
      title: words,
      description: pick("घरगुती बनावट, प्रेमाने तयार.", "घर का बना, प्यार से तैयार.", "Homemade with care."),
      category: "other",
      tags: [],
      attributes: { weight: "", ingredients: [], material: "", shelfLife: "" },
      suggestedPrice: { min: 99, max: 199, recommended: 149, reason: pick("सुरुवातीला मधली किंमत", "शुरुआत में बीच की कीमत", "Mid price to start") },
      photoQuality: { score: 0.7, issues: [], tips: [] },
      safetyNotes: [],
    })
  );
}

async function imageToBase64(url: string): Promise<{ mediaType: string; data: string } | null> {
  try {
    // Only local uploads are supported in this route.
    if (!url.startsWith("/uploads/")) return null;
    const buf = await readFile(join(process.cwd(), "public", url));
    const ext = url.split(".").pop()?.toLowerCase();
    const mediaType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return { mediaType, data: buf.toString("base64") };
  } catch {
    return null;
  }
}

/**
 * Generate a listing draft.
 * - Mock provider (default): deterministic fixtures, brief pacing delay.
 * - Groq provider: vision call, Zod-validated, retry once on bad JSON.
 * - Any Groq error/timeout/rate-limit falls back to mock with degraded: true.
 */
export async function generateListing(
  input: GenerateInput
): Promise<{ draft: ListingDraft; mocked: boolean; degraded: boolean }> {
  const provider = getAIProvider();
  const cacheParts = { transcript: input.transcript, locale: input.locale, images: input.imageUrls.length };
  const cached = await cacheGet<ListingDraft>("listing", cacheParts);
  if (cached && listingSchema.safeParse(cached).success) {
    return { draft: cached, mocked: provider.name === "mock", degraded: false };
  }
  if (provider.name === "mock") {
    // Demo pacing: keep the thinking animation visible briefly.
    await new Promise((r) => setTimeout(r, 1500));
    const draft = mockListing(input);
    await cacheSet("listing", cacheParts, draft, LISTING_CACHE_TTL_MS);
    return { draft, mocked: true, degraded: false };
  }

  const { system, user } = listingPrompt({
    transcript: input.transcript,
    locale: input.locale,
    region: input.region,
    imageCount: input.imageUrls.length,
  });
  const images: Array<{ mediaType: string; data: string }> = [];
  for (const u of input.imageUrls.slice(0, 4)) {
    const b = await imageToBase64(u);
    if (b) images.push(b);
  }
  const started = Date.now();
  let userText = user;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await provider.vision({ system, userText, images });
      let parsed = listingSchema.safeParse(JSON.parse(res.text));
      if (!parsed.success && attempt === 0) {
        // Repair retry: ask once more for bare JSON before falling back.
        userText = `${user}\nYour previous response was not valid JSON. Return ONLY the JSON object, no other text.`;
        const retry = await provider.vision({ system, userText, images });
        parsed = listingSchema.safeParse(JSON.parse(retry.text));
        if (parsed.success) {
          res.text = retry.text;
          res.promptTokens = (res.promptTokens ?? 0) + (retry.promptTokens ?? 0);
          res.completionTokens = (res.completionTokens ?? 0) + (retry.completionTokens ?? 0);
        }
      }
      if (!parsed.success) throw new Error("ai-invalid-json");
      const draft = stripBannedClaims(parsed.data);
      logAIUsage({
        feature: "listing.generate",
        provider: "groq",
        model: res.model,
        latencyMs: Date.now() - started,
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        userId: input.userId,
      });
      await cacheSet("listing", cacheParts, draft, LISTING_CACHE_TTL_MS);
      return { draft, mocked: false, degraded: false };
    } catch (e) {
      if (attempt === 1) {
        console.error("[ai] listing failed, falling back to mock", e);
        logAIUsage({
          feature: "listing.generate",
          provider: "groq",
          model: "fallback",
          degraded: true,
          latencyMs: Date.now() - started,
          userId: input.userId,
        });
        return { draft: mockListing(input), mocked: true, degraded: true };
      }
    }
  }
  return { draft: mockListing(input), mocked: true, degraded: true };
}
