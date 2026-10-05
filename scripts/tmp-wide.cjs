const puppeteer = require("puppeteer-core");
const BASE = "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);
(async () => {
  const jar = new Map();
  async function nfetch(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
    const r = await fetch(BASE + path, { ...opts, headers, redirect: "manual" });
    const sc = typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : [];
    for (const s of sc) {
      const kv = s.split(";")[0];
      const i = kv.indexOf("=");
      if (i > 0) jar.set(kv.slice(0, i).trim(), kv.trim());
    }
    return r;
  }
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });
  try {
    const post = (u, b) =>
      nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: PHONE });
    const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/orders" });
    await nfetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    // Seed content: product + paid order via API.
    const { writeFileSync, readFileSync } = require("fs");
    try { writeFileSync(".shots/t.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")); } catch {}
    const fd = new FormData();
    fd.append("photo", new Blob([readFileSync(".shots/t.png")], { type: "image/png" }), "p.png");
    const up = await nfetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    const draft = { title: "Audit Pickle With A Very Long Product Title Indeed", description: "Test description for overflow audit", category: "food", tags: [], attributes: { weight: "", ingredients: [], material: "", shelfLife: "" }, suggestedPrice: { min: 1, max: 2, recommended: 150, reason: "t" }, photoQuality: { score: 1, issues: [], tips: [] }, safetyNotes: [] };
    const pub = await post("/api/products", { draft, priceINR: 150, stock: 5, imageUrls: [up.url], fulfillment: "both" });
    console.log("pub:", JSON.stringify(pub).slice(0, 120));
    const prod = await nfetch("/api/products").then((r) => r.json());
    console.log("products:", prod.products?.length);
    await post("/api/orders", { shopSlug: pub.shopSlug, items: [{ productId: prod.products[0].id, qty: 1 }], buyerName: "A Very Long Buyer Name For Testing Overflow Behavior", buyerPhone: "9123456789", addressLine: "12 MG Road", pincode: "422001", fulfillment: "delivery" });

    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 800, isMobile: true });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const headers = { ...req.headers() };
      if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
      req.continue({ headers });
    });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("ojas-prefs", JSON.stringify({ state: { locale: "en", theme: "light", reduceMotion: false, voiceSpeed: 1, textSize: "base" }, version: 0 }));
    });
    for (const route of ["/app/orders", "/app/schemes", "/app/community", "/app/create"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 2000));
      const wide = await page.evaluate(() => {
        const chain = [];
        let el = [...document.querySelectorAll("div")].find((d) => d.scrollWidth > 700);
        while (el && chain.length < 8) {
          chain.push(`${el.tagName}[${(typeof el.className === "string" ? el.className : "").slice(0, 40)}] sw=${el.scrollWidth} cw=${el.clientWidth}`);
          el = el.parentElement;
        }
        return { innerW: window.innerWidth, docClient: document.documentElement.clientWidth, docScroll: document.documentElement.scrollWidth, chain };
      });
      console.log(route, JSON.stringify(wide));
    }
  } finally {
    await browser.close();
  }
})();
