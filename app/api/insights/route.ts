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
  if (gu) {
    return {
      summary: `Chhella 30 divas: ${orderCount} order, ${money} kamaani.`,
      s1: pending > 0 ? `${pending} order aagad vadhaarvana chhe — pehla ej pura karo.` : "Badha order time par — khub saras!",
      s2: top ? `${top} sauthi vadhaare vechaay chhe — teno stock taiyaar raakho.` : "Pehla order maate WhatsApp par link share karo.",
      s3: lowStock.length > 0 ? `${lowStock[0]} khutva aavyu — fari banaavo.` : lessonsDone < 3 ? "UPI lesson puro karo — payment saral thashe." : "Navo product jodo — dukaan taaji raakho.",
    };
  }
  if (locale === "ta") {
    return {
      summary: `Kadantha 30 naatkal: ${orderCount} order, ${money} varuvaai.`,
      s1: pending > 0 ? `${pending} ordergalai nagarthavum — mudhalil avaiyai mudikavum.` : "Ella order-um nerathil — arumai!",
      s2: top ? `${top} adhigam virkkiradhu — adhai stock-il vai.` : "Mudhal order-kkaaga WhatsApp-il link-ai share sei.",
      s3: lowStock.length > 0 ? `${lowStock[0]} theerndhu varugiradhu — meendum sei.` : lessonsDone < 3 ? "UPI paadam mudikavum — payment elidhaagum." : "Pudhiya porul ser — kadaiyai fresh-aaga vai.",
    };
  }
  if (mr) {
    return {
      summary: `Magil 30 divsat ${orderCount} order, ${money} kamai.`,
      s1: pending > 0 ? `${pending} order pudhe nyayche aahet — aadhi tech purn kara.` : "Saglya order velat purn — khup chhan!",
      s2: top ? `${top} sarvat jast viktay — tyacha stock tayyar theva.` : "Pahili order sathi WhatsApp var link share kara.",
      s3: lowStock.length > 0 ? `${lowStock[0]} sampat aala aahe — punha banva.` : lessonsDone < 3 ? "UPI lesson purna kara — payment sopa hoil." : "Navin product joda — dukaan taja theva.",
    };
  }
  if (hi) {
    return {
      summary: `Pichhle 30 din: ${orderCount} order, ${money} kamai.`,
      s1: pending > 0 ? `${pending} order aage badhane hain — pehle wahi poora karo.` : "Saare order time par — bahut badhiya!",
      s2: top ? `${top} sabse zyada bikta hai — uska stock ready rakho.` : "Pehle order ke liye WhatsApp par link share karo.",
      s3: lowStock.length > 0 ? `${lowStock[0]} khatm ho raha — dobara banao.` : lessonsDone < 3 ? "UPI lesson poora karo — payment aasaan hoga." : "Naya product jodo — dukaan taaza rakho.",
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
