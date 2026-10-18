import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { logAIUsage } from "@/lib/ai/usage";
import { cacheGet, cacheSet } from "@/lib/ai/cache";
import { rateLimit } from "@/lib/auth/rate-limit";

type Strings = { summary: string; s1: string; s2: string; s3: string };

function ruleInsights(args: {
  revenue: number;
  orderCount: number;
  pending: number;
  lowStock: string[];
  top: string | null;
  lessonsDone: number;
  locale: string;
}): Strings {
  const { revenue, orderCount, pending, lowStock, top, lessonsDone, locale } = args;
  const hi = locale !== "mr" && locale !== "en" && locale !== "gu" && locale !== "ta";
  const mr = locale === "mr";
  const gu = locale === "gu";
  const money = `₹${revenue}`;
  if (locale === "mr") {
    return {
      summary: `मागील ३० दिवसांत ${orderCount} ऑर्डर्स, ${money} कमाई.`,
      s1: pending > 0 ? `${pending} ऑर्डर्स पुढे पाठवायचे आहेत — आधी ते पूर्ण करा.` : "सर्व ऑर्डर्स वेळेत पूर्ण — खूप छान!",
      s2: top ? `${top} सर्वात जास्त विकले जात आहे — त्याचा साठा तयार ठेवा.` : "पहिल्या ऑर्डरसाठी WhatsApp वर लिंक शेअर करा.",
      s3: lowStock.length > 0 ? `${lowStock[0]} संपत आले आहे — पुन्हा बनवा.` : lessonsDone < 3 ? "UPI धडा पूर्ण करा — पेमेंट सोपे होईल." : "नवीन उत्पादन जोडा — दुकान ताजे ठेवा.",
    };
  }
  if (locale === "hi") {
    return {
      summary: `पिछले ३० दिनों में ${orderCount} ऑर्डर्स, ${money} कमाई.`,
      s1: pending > 0 ? `${pending} ऑर्डर्स आगे बढ़ाने हैं — पहले वही पूरे करें.` : "सभी ऑर्डर्स समय पर — बहुत बढ़िया!",
      s2: top ? `${top} सबसे ज्यादा बिकता है — उसका स्टॉक तैयार रखें.` : "पहले ऑर्डर के लिए WhatsApp पर लिंक शेयर करें.",
      s3: lowStock.length > 0 ? `${lowStock[0]} खत्म हो रहा है — दोबारा बनाएं.` : lessonsDone < 3 ? "UPI पाठ पूरा करें — पेमेंट आसान होगा." : "नया उत्पाद जोड़ें — दुकान ताज़ा रखें.",
    };
  }
  if (locale === "gu") {
    return {
      summary: `છેલ્લા ૩૦ દિવસ: ${orderCount} ઓર્ડર, ${money} કમાણી.`,
      s1: pending > 0 ? `${pending} ઓર્ડર આગળ વધારવાના છે — પહેલા એ જ પૂરા કરો.` : "બધા ઓર્ડર સમયસર — ખૂબ સરસ!",
      s2: top ? `${top} સૌથી વધુ વેચાય છે — તેનો સ્ટોક તૈયાર રાખો.` : "પહેલા ઓર્ડર માટે WhatsApp પર લિંક શેર કરો.",
      s3: lowStock.length > 0 ? `${lowStock[0]} ખૂટવા આવ્યું — ફરી બનાવો.` : lessonsDone < 3 ? "UPI પાઠ પૂરો કરો — પેમેન્ટ સરળ થશે." : "નવો પ્રોડક્ટ ઉમેરો — દુકાન તાજી રાખો.",
    };
  }
  if (locale === "ta") {
    return {
      summary: `கடந்த 30 நாட்கள்: ${orderCount} ஆர்டர்கள், ${money} வருவாய்.`,
      s1: pending > 0 ? `${pending} ஆர்டர்களை நகர்த்தவும் — முதலில் அவற்றை முடிக்கவும்.` : "எல்லா ஆர்டர்களும் சரியான நேரத்தில் — அற்புதம்!",
      s2: top ? `${top} அதிகம் விற்கிறது — அதை இருப்பு வைக்கவும்.` : "முதல் ஆர்டருக்காக WhatsApp-ல் லிங்க்கை பகிரவும்.",
      s3: lowStock.length > 0 ? `${lowStock[0]} தீர்ந்து வருகிறது — மீண்டும் செய்யவும்.` : lessonsDone < 3 ? "UPI பாடம் முடிக்கவும் — கட்டணம் எளிதாகும்." : "புதிய பொருளைச் சேர்க்கவும் — கடையைப் புத்துணர்ச்சியாக வைக்கவும்.",
    };
  }
  return {
    summary: `Last 30 days: ${orderCount} orders, ${money} revenue.`,
    s1: pending > 0 ? `${pending} orders need moving — finish those first.` : "All orders on time — excellent!",
    s2: top ? `${top} sells most — keep it stocked.` : "Share your link on WhatsApp for the first order.",
    s3: lowStock.length > 0 ? `${lowStock[0]} is running low — make more.` : lessonsDone < 3 ? "Finish the UPI lesson — payments get easy." : "Add a new product — keep the shop fresh.",
  };
}

/** Weekly business summary + 3 suggestions (Groq when configured, rules otherwise). Cached per shop-day. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const locale = new URL(req.url).searchParams.get("locale") || "hi";
  const rl = rateLimit(`ai:${session.user.id}`, 20, 60 * 1000);
  if (!rl.ok) return NextResponse.json({ code: "rate-limited" }, { status: 429 });

  const shops = await db.shop.findMany({ where: { ownerId: session.user.id }, include: { products: true } });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orders = await db.order.findMany({
    where: { shopId: { in: shops.map((s) => s.id) }, createdAt: { gte: since } },
  });
  const paid = orders.filter((o) => o.payStatus === "PAID" || o.payStatus === "COD_PENDING");
  const revenue = paid.reduce((a, o) => a + o.total, 0);
  const pending = orders.filter((o) => ["PLACED", "ACCEPTED", "PREPARING", "READY"].includes(o.status)).length;
  const lowStock = shops.flatMap((s) => s.products).filter((p) => p.status === "LIVE" && p.stock <= 3).map((p) => p.title).slice(0, 3);
  const byProduct = new Map<string, number>();
  for (const o of paid) {
    try {
      for (const i of JSON.parse(o.items) as Array<{ title: string; qty: number }>) {
        byProduct.set(i.title, (byProduct.get(i.title) || 0) + i.qty);
      }
    } catch {}
  }
  const top = [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const lessonsDone = await db.lessonProgress.count({ where: { userId: session.user.id, status: "DONE" } });

  const day = new Date().toISOString().slice(0, 10);
  const parts = { shops: shops.map((s) => s.id), day, locale, revenue, count: orders.length, pending };
  const cached = await cacheGet<Strings>("insights", parts);
  if (cached) return NextResponse.json({ ok: true, ...cached, cached: true, mocked: true });

  const rules = ruleInsights({ revenue, orderCount: orders.length, pending, lowStock, top, lessonsDone, locale });
  const provider = getAIProvider();
  if (provider.name === "mock") {
    await cacheSet("insights", parts, rules, 24 * 60 * 60 * 1000);
    return NextResponse.json({ ok: true, ...rules, cached: false, mocked: true });
  }
  const started = Date.now();
  try {
    const res = await provider.chat({
      system: `Summarize this small shop in ${locale} (2 short sentences), then exactly 3 one-line suggestions. Plain words. No guarantees.`,
      userText: `Revenue ₹${revenue}, orders ${orders.length}, pending ${pending}, low stock: ${lowStock.join(", ") || "none"}, bestseller: ${top || "none"}, lessons done: ${lessonsDone}.`,
      temperature: 0.6,
      maxTokens: 250,
      timeoutMs: 8000,
    });
    const lines = res.text.split("\n").map((s) => s.trim()).filter(Boolean);
    const out: Strings = { summary: lines[0] || rules.summary, s1: lines[1] || rules.s1, s2: lines[2] || rules.s2, s3: lines[3] || rules.s3 };
    await cacheSet("insights", parts, out, 24 * 60 * 60 * 1000);
    logAIUsage({ feature: "insights.weekly", provider: "groq", model: res.model, latencyMs: Date.now() - started, promptTokens: res.promptTokens, completionTokens: res.completionTokens, userId: session.user.id });
    return NextResponse.json({ ok: true, ...out, cached: false, mocked: false });
  } catch (e) {
    console.error("[ai] insights failed, rules fallback", e);
    await cacheSet("insights", parts, rules, 24 * 60 * 60 * 1000);
    return NextResponse.json({ ok: true, ...rules, cached: false, mocked: true, degraded: true });
  }
}
