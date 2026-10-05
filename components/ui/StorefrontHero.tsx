import { ListenButton } from "@/components/voice/ListenButton";

/** Public storefront hero: seller photo + voice greeting for buyers. */
export function StorefrontHero({ shopName, greeting }: { shopName: string; greeting: string }) {
  return (
    <section className="rounded-[20px] bg-[var(--clay-soft)] p-6" aria-label={`${shopName} storefront`}>
      <p className="display text-3xl font-bold">{shopName}</p>
      <p className="mt-1 text-base opacity-80">{greeting}</p>
      <div className="mt-3">
        <ListenButton text={`${shopName}. ${greeting}`} compact />
      </div>
    </section>
  );
}
