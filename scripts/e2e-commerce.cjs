/**
 * Phase 2 acceptance: demo commerce end to end.
 * Seller API (register, product) -> buyer UI (cart, checkout, card success /
 * decline / COD) -> seller fulfil (accept -> delivered) -> payout withdraw +
 * settle -> pooling -> buyer tracking.
 * Usage: node scripts/e2e-commerce.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");
const { readFileSync, writeFileSync } = require("fs");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);
const BUYER = "9123456789";

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[pay ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
  const jar = new Map();
  jar.set("ojas_locale", "ojas_locale=en");
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
  const postJSON = (u, b) =>
    nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const fail = async (page, msg) => {
    await page.screenshot({ path: ".shots/e2e-pay-fail.png" });
    throw new Error(msg);
  };
  let page;
  try {
    // Seller: register + login (Node side, real endpoints).
    await postJSON("/api/auth/otp/send", { phone: PHONE });
    const v = await postJSON("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    if (!v.ok) throw new Error("seller verify failed");
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/home" });
    const cb = await nfetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (cb.status !== 302) throw new Error("seller login failed");

    // Seller: upload photo + publish product via API.
    writeFileSync(".shots/test-pay.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
    const fd = new FormData();
    fd.append("photo", new Blob([readFileSync(".shots/test-pay.png")], { type: "image/png" }), "p.png");
    const up = await nfetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (!up.url) throw new Error("upload failed");
    const draft = {
      title: "Test Pickle", description: "E2E test product", category: "food", tags: [],
      attributes: { weight: "250g", ingredients: [], material: "", shelfLife: "" },
      suggestedPrice: { min: 100, max: 200, recommended: 150, reason: "test" },
      photoQuality: { score: 0.9, issues: [], tips: [] }, safetyNotes: [],
    };
    const pub = await postJSON("/api/products", { draft, priceINR: 150, stock: 10, imageUrls: [up.url], fulfillment: "both" });
    if (!pub.shopSlug) throw new Error("publish failed: " + JSON.stringify(pub));
    const shopUrl = `/shop/${pub.shopSlug}`;
    log(`shop live: ${shopUrl}`);

    // Buyer UI (no login): product -> cart -> checkout.
    page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const headers = { ...req.headers() };
      if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
      req.continue({ headers });
    });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("ojas-prefs", JSON.stringify({ state: { locale: "en", theme: "light", reduceMotion: false, voiceSpeed: 1, textSize: "base" }, version: 0 }));
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    const clickText = async (needle) => {
      const arr = Array.isArray(needle) ? needle : [needle];
      const handle = await page.evaluateHandle((names) => {
        return [...document.querySelectorAll("button, a")].find((e) => {
          const txt = (e.textContent || "").toLowerCase();
          return names.some((s) => txt.includes(s.toLowerCase()));
        });
      }, arr);
      const el = handle.asElement();
      if (!el) return false;
      await el.click();
      return true;
    };

    await page.goto(`${BASE}${shopUrl}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Test Pickle"), { timeout: 30000 });
    if (!(await clickText("Test Pickle"))) await fail(page, "product link missing");
    await page.waitForFunction(() => /buy now|aattach ghya/i.test(document.body.textContent), { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    if (!(await clickText(["Buy now", "Aattach ghya"]))) await fail(page, "buy-now missing");
    await page.waitForFunction(() => /checkout|order kara|place order/i.test(document.body.textContent), { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    log("cart -> checkout");

    // Fill checkout form.
    await page.type('input[autocomplete="name"]', "Buyer Bai");
    await page.type('input[autocomplete="tel"]', BUYER);
    await page.type("textarea", "12 MG Road, Nashik");
    await page.type('input[autocomplete="postal-code"]', "422001");
    if (!(await clickText(["Place order", "Order kara"]))) await fail(page, "place-order missing");
    await page.waitForFunction(() => window.location.pathname.includes("/pay/") || /demo|डेमो/i.test(document.body.textContent), { timeout: 20000 });
    log("order placed, gateway shown");

    // Pay with success test card.
    await page.waitForFunction(() => !document.body.textContent.includes("₹0") && /pay/i.test(document.body.textContent), { timeout: 30000 });
    await clickText(["Pay", "Pay kara"]);
    await page.waitForFunction(() => /UPI ID/i.test(document.body.textContent), { timeout: 30000 });
    if (!(await clickText("Card"))) await fail(page, "card tab missing");
    await page.type('input[autocomplete="cc-number"]', "4111 1111 1111 1111");
    await page.type('input[autocomplete="cc-exp"]', "12/28");
    await page.type('input[autocomplete="cc-csc"]', "123");
    await page.type('input[autocomplete="cc-name"]', "Buyer Bai");
    const payBtns = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /pay/i.test(b.textContent || "")).length);
    if (!payBtns) await fail(page, "pay button missing");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => /pay/i.test(b.textContent || "")).click();
    });
    await page.waitForFunction(() => /Bank OTP|OTP/i.test(document.body.textContent), { timeout: 20000 });
    // OTP boxes: type into each.
    const otpBoxes = await page.$$('input[autocomplete="one-time-code"]');
    for (const [i, box] of otpBoxes.entries()) await box.type("123456"[i]);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => /pay/i.test(b.textContent || "")).click();
    });
    await page.waitForFunction(() => /successful|safal|यशस्वी/i.test(document.body.textContent), { timeout: 20000 });
    const orderId = await page.evaluate(() => {
      const m = document.body.textContent.match(/Order ID:\s*([a-z0-9]+)/i);
      return m ? m[1] : null;
    });
    // Receipt page shows order id; otherwise grab from success heading flow.
    log(`card success${orderId ? ` order=${orderId.slice(0, 8)}` : ""}`);

    const myProductId = pub.productId;
    async function openMethodStage(orderId) {
      await page.goto(`${BASE}${shopUrl}/pay/${orderId}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => !document.body.textContent.includes("₹0") && /pay/i.test(document.body.textContent), { timeout: 30000 });
      await clickText(["Pay", "Pay kara"]);
      await page.waitForFunction(() => /UPI ID/i.test(document.body.textContent), { timeout: 30000 });
    }
    const o2 = await postJSON("/api/orders", {
      shopSlug: pub.shopSlug,
      items: [{ productId: myProductId, qty: 1 }],
      buyerName: "Buyer Bai", buyerPhone: BUYER, addressLine: "12 MG Road, Nashik", pincode: "422001", fulfillment: "delivery",
    });
    if (!o2.orderId) throw new Error("order2 failed: " + JSON.stringify(o2));
    await openMethodStage(o2.orderId);
    await clickText("Card");
    await page.type('input[autocomplete="cc-number"]', "4000 0000 0000 0002");
    await page.type('input[autocomplete="cc-exp"]', "12/28");
    await page.type('input[autocomplete="cc-csc"]', "123");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => /Pay/i.test(b.textContent || "")).click();
    });
    await page.waitForFunction(() => /failed|decline|रद्द|नाकारले/i.test(document.body.textContent), { timeout: 20000 });
    log("declined card shows failure + retry");

    // COD flow: third order, cash option.
    const o3 = await postJSON("/api/orders", {
      shopSlug: pub.shopSlug,
      items: [{ productId: myProductId, qty: 1 }],
      buyerName: "Buyer Bai", buyerPhone: BUYER, addressLine: "12 MG Road, Nashik", pincode: "422001", fulfillment: "pickup",
    });
    await openMethodStage(o3.orderId);
    await clickText(["Cash on delivery", "COD", "रोख"]);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => /Pay|Order/i.test(b.textContent || "")).click();
    });
    await page.waitForFunction(() => /Cash on delivery|COD|रोख|placed|स्वीकारली/i.test(document.body.textContent), { timeout: 20000 });
    log("COD placed");

    // Seller UI: orders list shows the paid order.
    await page.goto(`${BASE}/app/orders`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Buyer Bai"), { timeout: 15000 });
    log("seller sees orders");

    // Seller fulfil via API: accept -> preparing -> ready -> picked -> out -> delivered.
    const paidOrderId = (
      await nfetch("/api/orders?status=PLACED").then((r) => r.json())
    ).orders.find((o) => o.payStatus === "PAID")?.id;
    if (!paidOrderId) throw new Error("no paid order for fulfil");
    for (const to of ["ACCEPTED", "PREPARING", "READY", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"]) {
      const r = await postJSON(`/api/orders/${paidOrderId}`, { to });
      if (!r.ok) throw new Error(`advance to ${to} failed`);
    }
    log("fulfilled to DELIVERED");

    // Payout: withdraw + settle.
    const w = await postJSON("/api/payouts", { upiId: "seller@okbank" });
    if (!w.ok) throw new Error("withdraw failed");
    const st = await nfetch("/api/payouts/settle", { method: "POST" }).then((r) => r.json());
    if (!st.ok) throw new Error("settle failed");
    const po = await nfetch("/api/payouts").then((r) => r.json());
    if (!po.payouts.some((p) => p.status === "SETTLED")) throw new Error("no settled payout");
    log(`payout settled (net ${po.settledTotal})`);

    // Pooling + tracking.
    const pool = await postJSON("/api/delivery/batches", { pincode: "422001" });
    if (!pool.ok) throw new Error("pool failed: " + JSON.stringify(pool));
    log(`pool batch: ${pool.count} orders`);
    const tr = await nfetch(`/api/orders/track?orderId=${paidOrderId}&phone=${BUYER}`).then((r) => r.json());
    if (!tr.ok || tr.order.status !== "DELIVERED") throw new Error("tracking wrong: " + JSON.stringify(tr).slice(0, 120));
    log("tracking shows DELIVERED");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    const secs = (Date.now() - started) / 1000;
    console.log(JSON.stringify({ ok: true, seconds: Math.round(secs * 10) / 10 }));
  } catch (err) {
    try {
      if (page) {
        console.error("PAGE URL AT ERROR:", page.url());
        const pageTxt = await page.evaluate(() => document.body.innerText);
        console.error("PAGE TEXT AT ERROR:\n" + pageTxt);
        await page.screenshot({ path: ".shots/e2e-pay-fail.png" });
      }
    } catch {}
    throw err;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-COMMERCE FAILED:", e.stack || e.message);
  process.exit(1);
});
