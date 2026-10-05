"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { AuthError } from "@/components/auth/AuthError";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/lib/cart/store";
import { inr } from "@/lib/utils";

/** Buyer checkout: details → order → demo gateway. No login. */
export default function CheckoutPage() {
  const t = useTranslations("shop");
  const te = useTranslations("auth.errors");
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, setQty, remove, clear, add } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("411001");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("delivery");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const pId = searchParams?.get("p");
    if (pId && items.length === 0) {
      const title = searchParams.get("title") || "Product";
      const price = Number(searchParams.get("price")) || 0;
      const image = searchParams.get("img") || "";
      add(params.slug, { productId: pId, title, price, image }, 1);
    }
  }, [searchParams, items.length, params.slug, add]);

  const fee = fulfillment === "delivery" ? 30 : 0;
  const total = subtotal() + fee;

  async function place() {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (name.trim().length < 2) {
      setError("Please enter your name (at least 2 letters).");
      return;
    }
    if (cleanPhone.length !== 10) {
      setError(te("invalidPhone"));
      return;
    }
    const cleanAddress = address.trim() || (fulfillment === "pickup" ? "Village Shop Pickup" : "Village Centre");
    const cleanPincode = (pincode.replace(/\D/g, "") || "411001").slice(0, 6).padEnd(6, "0");

    setBusy(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shopSlug: params.slug,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          buyerName: name.trim(),
          buyerPhone: cleanPhone,
          addressLine: cleanAddress,
          pincode: cleanPincode,
          fulfillment,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; orderId?: string; code?: string };
      if (!r.ok || !j.orderId) {
        if (j.code === "out-of-stock") {
          setError("Requested quantity exceeds available stock. Please reduce item quantity below.");
        } else if (j.code === "product-unavailable") {
          setError("One of the items in your cart is currently unavailable.");
        } else if (j.code === "shop-closed") {
          setError("This shop is currently not accepting new orders.");
        } else {
          setError(te("somethingWrong"));
        }
        return;
      }
      clear();
      window.location.href = `/shop/${params.slug}/pay/${j.orderId}`;
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--turmeric)] border-t-transparent" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-10">
        <EmptyState icon="🧺" title={t("cartEmpty")} />
      </main>
    );
  }

  const field = "min-h-[58px] rounded-[14px] border-2 bg-[var(--card)] px-4 text-base md:text-lg focus:outline-none focus:border-[var(--turmeric)] transition-all";
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pb-20 pt-6">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <h1 className="display text-2xl md:text-3xl font-bold">{t("checkout")}</h1>
        <span className="text-sm font-semibold opacity-70">{items.length} items</span>
      </div>

      <AuthError message={error} />

      {/* Cart Items with quantity adjusters */}
      <section className="flex flex-col gap-2 rounded-[20px] border bg-[var(--card)] p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wider opacity-60">Order Summary</h2>
        <ul className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((i) => (
            <li key={i.productId} className="flex items-center justify-between gap-3 py-3 text-base">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{i.title}</p>
                <p className="text-sm opacity-70">{inr(i.price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => i.qty > 1 ? setQty(i.productId, i.qty - 1) : remove(i.productId)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--card)] text-base font-bold shadow-xs active:scale-95"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold">{i.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(i.productId, i.qty + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--card)] text-base font-bold shadow-xs active:scale-95"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="w-16 text-right font-bold">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Buyer Details Form */}
      <section className="flex flex-col gap-3 rounded-[20px] border bg-[var(--card)] p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wider opacity-60">Customer Details</h2>
        <label className="flex flex-col gap-1 text-sm md:text-base font-bold">
          {t("yourName")} *
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={60}
            placeholder="e.g. Sunita Sharma"
            className={field}
            style={{ borderColor: "var(--border)" }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:text-base font-bold">
          {t("yourPhone")} (10 digits) *
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
            inputMode="tel"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            className={field}
            style={{ borderColor: "var(--border)" }}
          />
        </label>

        {/* Fulfillment selection */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold">Delivery Preference</span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Delivery preference">
            {(["pickup", "delivery"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFulfillment(f)}
                aria-pressed={fulfillment === f}
                className="min-h-[52px] rounded-[12px] border-2 px-3 text-sm md:text-base font-bold transition-all"
                style={{
                  borderColor: fulfillment === f ? "var(--turmeric)" : "var(--border)",
                  background: fulfillment === f ? "var(--clay-soft)" : "var(--card)",
                }}
              >
                {f === "pickup" ? `🏪 ${t("pickup")} (Free)` : `🚚 ${t("deliveryOpt")} (+₹30)`}
              </button>
            ))}
          </div>
        </div>

        {fulfillment === "delivery" && (
          <>
            <label className="flex flex-col gap-1 text-sm md:text-base font-bold">
              {t("address")}
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                maxLength={200}
                autoComplete="street-address"
                placeholder="Village / Street / House number"
                className="rounded-[12px] border-2 bg-[var(--card)] px-4 py-2.5 text-base md:text-lg focus:outline-none focus:border-[var(--turmeric)]"
                style={{ borderColor: "var(--border)" }}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm md:text-base font-bold">
              {t("pincode")}
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="411001"
                className={field}
                style={{ borderColor: "var(--border)" }}
              />
            </label>
          </>
        )}
      </section>

      {/* Bill summary & Action */}
      <div className="flex items-center justify-between rounded-[16px] bg-[var(--clay-soft)] p-4">
        <div>
          <p className="text-xs uppercase font-bold opacity-60">Total Payable</p>
          <p className="display text-3xl font-bold">{inr(total)}</p>
        </div>
        {fee > 0 && <span className="text-xs opacity-70">Includes ₹{fee} delivery</span>}
      </div>

      <BigButton onClick={place} state={busy ? "loading" : "idle"}>
        {t("placeOrder")} · {inr(total)}
      </BigButton>
    </main>
  );
}
