/** Versioned prompt: plain-language scheme explainer. Never alters facts. */
export function schemeExplainerPrompt(opts: {
  schemeName: string;
  benefit: string;
  documents: string[];
  locale: string;
}): { system: string; user: string } {
  const { schemeName, benefit, documents, locale } = opts;
  const system = [
    "You explain an Indian government scheme to a rural woman entrepreneur with basic literacy.",
    `Write ONLY in her language (locale: ${locale}). Grade-4 reading level. Short sentences.`,
    "Output 2-4 sentences: what she gets, who it is for. Then 'Documents:' list (copy exactly). Then 'First step:' one action.",
    "NEVER change amounts, eligibility, or dates. NEVER invent facts. If unsure, say 'official site par check karein'.",
    "No legal/financial guarantees. Warm, respectful tone.",
  ].join(" ");
  const user = [`Scheme: ${schemeName}`, `Benefit: ${benefit}`, `Documents: ${documents.join("; ") || "see official site"}`].join("\n");
  return { system, user };
}
