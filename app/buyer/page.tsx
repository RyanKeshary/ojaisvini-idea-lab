"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, ArrowRight, Clock, Store, CheckCircle2, ChevronRight, Globe } from "lucide-react";
import { inr } from "@/lib/utils";
import { usePrefs } from "@/lib/store/prefs";
import type { Locale } from "@/lib/i18n/config";

type LangKey = "en" | "hi" | "mr";

const I18N = {
  en: {
    buyerBadge: "Buyer",
    switchSeller: "Switch to Seller App",
    heroBadge: "Direct from Rural Women Makers",
    heroTitle: "Empower Village Women with Every Purchase",
    heroSub: "Every purchase directly funds the micro-enterprise of a village woman. No middlemen, verified quality, and 100% transparent UPI payouts.",
    browseShops: "Browse Artisan Shops",
    recentOrders: "My Recent Orders",
    autoTrack: "Auto-tracked with UPI & WhatsApp",
    noOrders: "No recent orders found. Visit a village shop below to make your first direct order!",
    orderedOn: "Ordered on",
    liveTrack: "Live Track",
    featuredShops: "Featured Rural Shops",
    verifiedSellers: "100% Verified Sellers",
    visitShop: "Visit Shop",
    backHome: "Back to Home",
    viewAllShops: "View All Village Shops",
  },
  hi: {
    buyerBadge: "ग्राहक",
    switchSeller: "विक्रेता ऐप पर जाएं",
    heroBadge: "ग्रामीण महिला कारीगरों से सीधा संपर्क",
    heroTitle: "हर खरीदारी से गाँव की बहनों को सशक्त बनाएं",
    heroSub: "आपकी हर खरीद से सीधे गाँव की महिला उद्यमी को कमाई मिलती है। बिना किसी बिचौलिए के, 100% सुरक्षित और पारदर्शी UPI भुगतान।",
    browseShops: "कारीगर दुकानें देखें",
    recentOrders: "मेरे हालिया ऑर्डर्स",
    autoTrack: "UPI और व्हाट्सएप द्वारा ऑटो-ट्रैक",
    noOrders: "कोई हालिया ऑर्डर नहीं मिला। पहला ऑर्डर करने के लिए नीचे किसी गाँव की दुकान पर जाएं!",
    orderedOn: "ऑर्डर दिनांक",
    liveTrack: "लाइव ट्रैक",
    featuredShops: "प्रमुख ग्रामीण दुकानें",
    verifiedSellers: "100% प्रमाणित विक्रेता",
    visitShop: "दुकान देखें",
    backHome: "मुख्य पृष्ठ पर वापस",
    viewAllShops: "सभी ग्रामीण दुकानें देखें",
  },
  mr: {
    buyerBadge: "ग्राहक",
    switchSeller: "विक्रेता ॲपवर जा",
    heroBadge: "गावातील महिला कारागिरांकडून थेट खरेदी",
    heroTitle: "प्रत्येक खरेदीतून ग्रामीण महिलांचे सक्षमीकरण",
    heroSub: "तुमच्या प्रत्येक खरेदीचा थेट फायदा गावातील महिला उद्योजिकेला होतो. कोणताही दलाल नाही, अस्सल दर्जा आणि पारदर्शक UPI पेमेंट.",
    browseShops: "कारागीर दुकाने पाहा",
    recentOrders: "माझे नुकतेच झालेले ऑर्डर्स",
    autoTrack: "UPI आणि व्हॉट्सॲपद्वारे ट्रॅकिंग",
    noOrders: "अद्याप कोणतीही ऑर्डर नाही. पहिली ऑर्डर करण्यासाठी खालील गावातील दुकानाला भेट द्या!",
    orderedOn: "ऑर्डर तारीख",
    liveTrack: "लाइव्ह ट्रॅक",
    featuredShops: "प्रसिद्ध ग्रामीण दुकाने",
    verifiedSellers: "100% पडताळणी केलेले विक्रेते",
    visitShop: "दुकान उघडा",
    backHome: "मुख्य पानावर जा",
    viewAllShops: "सर्व ग्रामीण दुकाने पाहा",
  },
};

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
  const { locale, setLocale } = usePrefs();
  const [lang, setLang] = useState<LangKey>("en");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with global store & localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("buyer_lang") as LangKey;
      if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "mr")) {
        setLang(savedLang);
      } else if (locale === "mr" || locale === "hi" || locale === "en") {
        setLang(locale as LangKey);
      }
    } catch {}
  }, [locale]);

  const changeLang = (l: LangKey) => {
    setLang(l);
    try {
      localStorage.setItem("buyer_lang", l);
      // also update global app locale for consistent cookies & html attributes
      setLocale(l as Locale);
    } catch {}
  };

  const t = I18N[lang] || I18N.en;

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
      {/* Sticky Header with Language Switcher */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg shadow-sm">
              ओ
            </div>
            <div>
              <span className="font-bold tracking-tight text-neutral-900 text-base">Ojasvini</span>
              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {t.buyerBadge}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher Buttons */}
            <div className="inline-flex items-center rounded-xl bg-neutral-100 p-0.5 border border-neutral-200/80">
              <button
                type="button"
                onClick={() => changeLang("en")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === "en" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => changeLang("hi")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === "hi" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => changeLang("mr")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === "mr" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                मराठी
              </button>
            </div>

            <Link
              href="/app/home"
              className="text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors hidden sm:inline"
            >
              {t.switchSeller} &rarr;
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
        {/* Hero Banner */}
        <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full mb-2">
                <ShoppingBag className="w-3.5 h-3.5" /> {t.heroBadge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {t.heroTitle}
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-neutral-600 max-w-xl">
                {t.heroSub}
              </p>
            </div>
            <Link
              href="/shop/sunita-swad"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98] shrink-0"
            >
              {t.browseShops} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" /> {t.recentOrders}
            </h2>
            <span className="text-xs text-neutral-500 font-medium">{t.autoTrack}</span>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && !loading ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
                {t.noOrders}
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
                          <Clock className="w-3 h-3" /> {t.orderedOn} {new Date(order.createdAt).toLocaleDateString()}
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
                          {t.liveTrack}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Featured Rural Shops */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" /> {t.featuredShops}
            </h2>
            <span className="text-xs text-neutral-500">{t.verifiedSellers}</span>
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
                      {t.visitShop} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-900 mt-3 text-base group-hover:text-amber-800 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{s.bio}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span>/shop/{s.slug}</span>
                  <span className="font-medium text-emerald-600">Online Store</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
