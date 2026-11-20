"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, ArrowRight, Clock, Store, CheckCircle2, ChevronRight } from "lucide-react";
import { inr } from "@/lib/utils";

type OrderItem = {
  id: string;
  buyerName: string;
  buyerPhone: string;
  total: number;
  status: string;
  payStatus: string;
  items: string;
  createdAt: string;
  shop?: {
    name: string;
    slug: string;
  };
};

type ShopItem = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  theme: string;
};

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.orders)) {
          setOrders(d.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setShops([
      {
        id: "shop-1",
        name: "सुनीता स्वाद गृह उद्योग (Sunita's Food)",
        slug: "sunita-swad",
        bio: "घरगुती लोणचे, अस्सल पापड आणि साजूक तूप. (Nashik, Maharashtra)",
        theme: "turmeric",
      },
      {
        id: "shop-2",
        name: "राधा हस्तकला व वस्त्र निकेतन (Radha Handloom)",
        slug: "radha-creations",
        bio: "कढ़ाई वाला चंदेरी सिल्क दुपट्टा व हातमाग साड्या. (Varanasi, UP)",
        theme: "rose",
      },
      {
        id: "shop-3",
        name: "ભાવના ગૃહ ઉદ્યોગ (Bhavna Snacks)",
        slug: "bhavna-gruh-udhyog",
        bio: "કાઠિયાવાડી પારંપરિક છૂંદો आणि खाखरा. (Surat, Gujarat)",
        theme: "amber",
      },
      {
        id: "shop-4",
        name: "மீனாட்சி பாரம்பரிய கைத்தறி (Meenakshi Crafts)",
        slug: "meenakshi-handlooms",
        bio: "சுத்தமான பருத்தி ஆடைகள் மற்றும் கைத்தறி. (Madurai, Tamil Nadu)",
        theme: "indigo",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-neutral-900 pb-20">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg shadow-sm">
              ओ
            </div>
            <div>
              <span className="font-bold tracking-tight text-neutral-900 text-base">Ojasvini</span>
              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Buyer
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app/home"
              className="text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Switch to Seller App &rarr;
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
        <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full mb-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Buyer Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Direct from Rural Women Makers
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-neutral-600 max-w-xl">
                Every purchase directly funds the micro-enterprise of a village woman. No middlemen, verified quality, and 100% transparent UPI payouts.
              </p>
            </div>
            <Link
              href="/shop/sunita-swad"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Browse Artisan Shops <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" /> My Recent Orders
            </h2>
            <span className="text-xs text-neutral-500 font-medium">Auto-tracked with UPI & WhatsApp</span>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && !loading ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
                No recent orders found. Visit a village shop below to make your first direct order!
              </div>
            ) : (
              orders.slice(0, 3).map((order) => {
                let itemsList: any[] = [];
                try {
                  itemsList = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
                } catch {}

                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-sm hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm sm:text-base">
                            {order.shop?.name || "Ojasvini Rural Artisan"}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {itemsList.map((i) => `${i.title} (${i.qty}x)`).join(", ") || "Handcrafted Village Goods"}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-neutral-100 sm:border-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-extrabold text-neutral-900">{inr(order.total)}</div>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {order.payStatus}
                        </span>
                      </div>
                      {order.shop?.slug && (
                        <Link
                          href={`/shop/${order.shop.slug}/track?orderId=${order.id}&phone=${order.buyerPhone || "9811100001"}`}
                          className="rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Live Track
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" /> Featured Rural Shops
            </h2>
            <span className="text-xs text-neutral-500">100% Verified Sellers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shops.map((s) => (
              <Link
                key={s.id}
                href={`/shop/${s.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/60 text-orange-800 font-bold text-base">
                      {s.name.slice(0, 1)}
                    </div>
                    <span className="text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Visit Shop <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-neutral-900 text-base group-hover:text-amber-800 transition-colors">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {s.bio}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span>Fast Delivery Pooling</span>
                  <span className="text-emerald-700 font-semibold">Direct UPI Pay</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
