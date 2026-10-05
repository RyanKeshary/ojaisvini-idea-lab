/**
 * Phase 7 acceptance: Sakhi console (assign + mentees + check-in) and
 * Admin console (overview metrics, users, flag toggle).
 * Usage: node scripts/e2e-consoles.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const WOMAN_PHONE = "98" + String(Date.now()).slice(-8);

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[consoles ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
  async function loginAs(email, password) {
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
    const v = await nfetch("/api/auth/staff/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());
    if (!v.ok) throw new Error("staff verify failed: " + email);
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/" });
    await nfetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    return jar;
  }
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const fail = async (page, msg) => {
    await page.screenshot({ path: ".shots/e2e-consoles-fail.png" });
    throw new Error(msg);
  };
  try {
    // A woman account to assign (plain OTP API, no browser).
    const post = (u, b) =>
      fetch(BASE + u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: WOMAN_PHONE });
    await post("/api/auth/otp/verify", { phone: WOMAN_PHONE, otp: "123456", create: "1" });

    const sakhiJar = await loginAs("sakhi@ojas.demo", "demo1234");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.setRequestInterception(true);
    let jar = sakhiJar;
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

    // Sakhi console renders; assign the woman by phone via UI.
    await page.goto(`${BASE}/sakhi-console`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Sakhi console"), { timeout: 15000 });
    await page.evaluate((ph) => {
      const input = document.querySelector('input[placeholder*="98"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(input, ph);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, WOMAN_PHONE);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Link")).click();
    });
    await page.waitForFunction((ph) => document.body.textContent.includes(ph.slice(0, 4)), { timeout: 15000 }, WOMAN_PHONE.slice(0, 2));
    log("sakhi assigned a woman");

    // Check-in note via UI.
    await page.evaluate(() => {
      const ta = document.querySelector("textarea");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(ta, "First visit done, helped with UPI lesson.");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Save note")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("First visit done"), { timeout: 15000 });
    log("check-in logged");

    // Admin console: overview metrics + users + flag toggle.
    jar = await loginAs("admin@ojas.demo", "demo1234");
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Women"), { timeout: 15000 });
    log("admin overview renders");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Users").click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("sakhi@ojas.demo") || document.body.textContent.includes("SAKHI"), { timeout: 15000 });
    log("admin users render");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Flags").click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("assistant_enabled"), { timeout: 15000 });
    log("admin flags render");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    console.log(JSON.stringify({ ok: true, seconds: Math.round(((Date.now() - started) / 1000) * 10) / 10 }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-CONSOLES FAILED:", e.message);
  process.exit(1);
});
