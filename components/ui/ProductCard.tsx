import { inr } from "@/lib/utils";
import { PriceTag } from "./PriceTag";
import { StatusPill } from "./StatusPill";

export function ProductCard({
  title,
  price,
  image,
  status = "LIVE",
}: {
  title: string;
  price: number;
  image?: string;
  status?: "DRAFT" | "LIVE" | "PAUSED";
}) {
  return (
    <article className="overflow-hidden rounded-[20px] border bg-[var(--card)]" style={{ borderColor: "var(--border)" }}>
      <div className="skeleton aspect-square w-full" aria-hidden>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div>
          <h3 className="text-lg font-bold leading-snug">{title}</h3>
          <PriceTag amount={price} />
        </div>
        <StatusPill status={status} />
      </div>
    </article>
  );
}

export function demoPrice() {
  return inr(150);
}
