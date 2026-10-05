"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { inr } from "@/lib/utils";

/** Fake WhatsApp catalog builder: name + price → live preview card. */
export function WaCatalog({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("learn");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<Array<{ name: string; price: number }>>([]);

  function add() {
    const p = parseInt(price || "0", 10);
    if (name.trim().length < 2 || !Number.isFinite(p) || p < 1) return;
    setItems((xs) => [...xs, { name: name.trim(), price: p }]);
    setName("");
    setPrice("");
    if (items.length + 1 >= 1) onDone?.();
  }

  const field = "min-h-[56px] rounded-[12px] border-2 bg-transparent px-3 text-base";
  return (
    <div className="rounded-[20px] border-2 border-dashed bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }} aria-label={t("waSim")}>
      <p className="text-base font-bold">{t("waSim")}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t("waName")}
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={field} style={{ borderColor: "var(--border)" }} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t("waPrice")}
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className={field} style={{ borderColor: "var(--border)" }} />
        </label>
      </div>
      <button type="button" onClick={add} className="mt-2 min-h-[56px] w-full rounded-[12px] bg-[var(--leaf)] text-base font-bold text-white">
        {t("waAdd")}
      </button>
      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2" aria-label="Catalog preview">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 rounded-[12px] bg-[var(--clay-soft)] p-3">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full bg-[var(--card)] text-xl">🧺</span>
              <div>
                <p className="font-bold">{it.name}</p>
                <p className="text-sm opacity-70">{inr(it.price)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
