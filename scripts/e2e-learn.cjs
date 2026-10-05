/**
 * Phase 3 acceptance: learn hub -> UPI lesson -> simulator -> quiz -> badge.
 * Usage: node scripts/e2e-learn.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[learn ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
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
    await page.screenshot({ path: ".shots/e2e-learn-fail.png" });
    throw new Error(msg);
  };
  try {
    const post = (u, b) =>
      nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: PHONE });
    const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    if (!v.ok) throw new Error("login failed");
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/learn" });
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

    // Hub loads 8 journeys.
    await page.goto(`${BASE}/app/learn`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("UPI"), { timeout: 15000 });
    log("hub renders journeys");

    // UPI lesson 1: simulator + quiz (answer index 1) + finish.
    await page.goto(`${BASE}/app/learn/upi/upi-1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("What is UPI"), { timeout: 15000 });
    // Fake UPI: set amount via quick button, send, success.
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "₹300").click();
    });
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Send")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Sent!"), { timeout: 10000 });
    log("simulator done");
    // Quiz: upi-1 answer is option index 1.
    await page.evaluate(() => {
      const group = [...document.querySelectorAll('[role="group"]')].find((g) => (g.getAttribute("aria-label") || "").includes("receive money"));
      const btns = group ? [...group.querySelectorAll("button")] : [];
      (btns[1] || btns[0]).click();
    });
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Check").click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Correct!"), { timeout: 10000 });
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Finish lesson")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Lesson complete"), { timeout: 15000 });
    const body = await page.evaluate(() => document.body.textContent);
    if (!body.includes("first-step")) throw new Error("first-step badge missing");
    log("quiz passed, badge earned");

    // Hub shows progress + badge.
    await page.goto(`${BASE}/app/learn`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("✅"), { timeout: 15000 });
    log("hub shows completed lesson");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    console.log(JSON.stringify({ ok: true, seconds: Math.round(((Date.now() - started) / 1000) * 10) / 10 }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-LEARN FAILED:", e.message);
  process.exit(1);
});
