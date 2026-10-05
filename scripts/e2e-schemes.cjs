/**
 * Phase 4 acceptance: match-me wizard -> eligible list -> explain -> save.
 * Usage: node scripts/e2e-schemes.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[schemes ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
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
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const fail = async (page, msg) => {
    await page.screenshot({ path: ".shots/e2e-schemes-fail.png" });
    throw new Error(msg);
  };
  try {
    const post = (u, b) =>
      nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: PHONE });
    const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    if (!v.ok) throw new Error("login failed");
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/schemes" });
    await nfetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const page = await browser.newPage();
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
    const clickText = (substr) =>
      page.evaluate((s) => {
        const el = [...document.querySelectorAll("button, a")].find((e) => (e.textContent || "").includes(s));
        if (!el) return false;
        el.click();
        return true;
      }, substr);

    await page.goto(`${BASE}/app/schemes`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Match me"), { timeout: 15000 });
    if (!(await clickText("Match me"))) await fail(page, "match-me missing");
    // Wizard: MH -> 31–45 -> Food -> ₹1–3L -> SHG yes.
    for (const pick of ["Maharashtra", "31–45", "Food", "₹1–3L", "Yes, member"]) {
      await page.waitForFunction((s) => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes(s)), { timeout: 10000 }, pick);
      if (!(await clickText(pick))) await fail(page, `wizard pick missing: ${pick}`);
      await new Promise((r) => setTimeout(r, 500));
    }
    await page.waitForFunction(() => document.body.textContent.includes("Mudra"), { timeout: 15000 });
    log("wizard returns ranked list with Mudra");

    // Explain simply on the first card.
    if (!(await clickText("Explain simply"))) await fail(page, "explain missing");
    await page.waitForFunction(() => document.body.textContent.includes("First step") || document.body.textContent.includes("first step") || document.body.textContent.includes("Sakhi"), { timeout: 20000 });
    log("AI explanation shown (mock)");
    if (!(await clickText("Save"))) await fail(page, "save missing");
    await new Promise((r) => setTimeout(r, 800));

    // Detail page: documents + official link + verify note.
    const href = await page.evaluate(() => {
      const a = [...document.querySelectorAll("a")].find((x) => (x.textContent || "").includes("Mudra"));
      return a ? a.getAttribute("href") : null;
    });
    if (!href) await fail(page, "detail link missing");
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Documents"), { timeout: 15000 });
    const detail = await page.evaluate(() => document.body.textContent);
    if (!detail.includes("Official site") || !detail.toLowerCase().includes("official site")) await fail(page, "verify note missing");
    log("detail page complete");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    console.log(JSON.stringify({ ok: true, seconds: Math.round(((Date.now() - started) / 1000) * 10) / 10 }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-SCHEMES FAILED:", e.message);
  process.exit(1);
});
