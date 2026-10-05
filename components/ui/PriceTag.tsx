import { inr } from "@/lib/utils";

/** Paper price tag with flip-in animation target. */
export function PriceTag({ amount, spoken }: { amount: number; spoken?: string }) {
  return (
    <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--clay-soft)] px-3 py-1 text-lg font-bold" aria-label={spoken ?? inr(amount)}>
      <span aria-hidden>₹</span>
      <span>{new Intl.NumberFormat("en-IN").format(amount)}</span>
    </p>
  );
}
