import { parseIndicNumber } from "@/lib/voice/numbers";

export type ReviewCommand =
  | { kind: "SET_PRICE"; price: number }
  | { kind: "PUBLISH" }
  | { kind: "RERECORD" }
  | { kind: "READ" }
  | { kind: "UNKNOWN"; text: string };

const PRICE_HINT = /(daam|kimat|keemat|price|rate|rupay|rupaye|raakho|rakho|karo|set)/;
const PUBLISH_HINT = /(publish|pakka|ho gaya|done|tayyar|confirm|haan publish)/;
const YES = /^(haan|ha|ho|yes|barobar|barobar ahe|thik|theek|sahi|bilkul)\b/;
const RERECORD = /(dobara|parat|phir|retry|badlo|change|dusra)/;
const READ = /(padho|sunao|vaacha|read|bolo phir|repeat)/;

/**
 * Rule-based parser for the listing-review step (Claude fallback later).
 * Handles: "Daam 150 rakho", "Kimmat ek sau pachaas", "Haan publish",
 * "Dobara", "Padho".
 */
export function parseReviewCommand(text: string): ReviewCommand {
  const t = text.toLowerCase().trim();
  if (READ.test(t)) return { kind: "READ" };
  if (RERECORD.test(t) && !PRICE_HINT.test(t)) return { kind: "RERECORD" };
  // In review context a bare "Haan" confirms the draft → publish.
  // Publish is reversible (pause from My Products), so voice-confirm is safe.
  if (PUBLISH_HINT.test(t) || YES.test(t)) return { kind: "PUBLISH" };
  const price = parseIndicNumber(t);
  if (price !== null && (PRICE_HINT.test(t) || price >= 10)) {
    // Bare numbers ≥10 in review context are treated as price corrections.
    return { kind: "SET_PRICE", price };
  }
  return { kind: "UNKNOWN", text };
}
