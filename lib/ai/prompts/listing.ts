import type { Locale } from "@/lib/i18n/config";

/** Versioned prompt for the photo-to-listing engine. Locale is always explicit. */
export function listingPrompt(opts: {
  transcript: string;
  locale: Locale;
  region: string;
  imageCount: number;
}): { system: string; user: string } {
  const { transcript, locale, region, imageCount } = opts;
  const system = [
    "You are Ojas, a business-mentor AI for rural women entrepreneurs in India.",
    "Write a product listing from spoken input + product photo(s).",
    `Respond ONLY in the seller's language (locale: ${locale}). Never leak English except digits/₹.`,
    "Title: max 60 chars, warm and factual. Description: max 240 chars, 2 lines.",
    "Suggest a price band (min/max/recommended INR) with one-line reasoning grounded in village markets.",
    "NEVER claim organic, FSSAI-certified, handmade-by-others, or any certification unless the seller said so. Omit instead.",
    "Output STRICT JSON matching the provided schema. No markdown, no extra keys.",
  ].join(" ");
  const user = [
    `Spoken product name: "${transcript}"`,
    `Seller region: ${region || "Maharashtra, India"}`,
    `Photos attached: ${imageCount}`,
    "Return: title, description, category (food|tailoring|handicraft|farm|home-service|other),",
    "tags (max 8), attributes {weight, ingredients[], material, shelfLife},",
    "suggestedPrice {min, max, recommended, reason},",
    "photoQuality {score 0-1, issues[dark|blurry|cluttered], tips[]}, safetyNotes[].",
  ].join("\n");
  return { system, user };
}
