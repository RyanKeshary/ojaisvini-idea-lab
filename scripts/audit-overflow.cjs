/**
 * Phase 10 responsive audit: every route at 360/768/1440, in hi/mr/en/gu/ta,
 * light/dark — asserts zero horizontal overflow and zero console errors.
 * Usage: node scripts/audit-overflow.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const ROUTES = ["/", "/gallery", "/auth/login", "/auth/register", "/app/home", "/app/learn", "/app/create", "/app/products", "/app/orders", "/app/schemes", "/app/community", "/app/assistant", "/offline"];
const VIEWPORTS = [
  { w: 360, h: 800 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
];
const LOCALES = [
  { locale: "hi", theme: "light" },
  { locale: "mr", theme: "dark" },
  { locale: "en", theme: "light" },
  { locale: "gu", theme: "light" },
  { locale: "ta", theme: "dark" },
];

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
  // One login; session jar reused for protected routes.
  const phone = "98" + String(Date.now()).slice(-8);
  const post = (u, b) =>
    nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
  await post("/api/auth/otp/send", { phone });
  const v = await post("/api/auth/otp/verify", { phone, otp: "123456", create: "1" });
  const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
  const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/home" });
  await nfetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const failures = [];
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const headers = { ...req.headers() };
      if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
      req.continue({ headers });
    });
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.w < 640 });
      for (const loc of LOCALES) {
        await page.evaluateOnNewDocument((p) => {
          localStorage.setItem("ojas-prefs", JSON.stringify({ state: p, version: 0 }));
        }, { locale: loc.locale, theme: loc.theme, reduceMotion: false, voiceSpeed: 1, textSize: "base" });
        for (const route of ROUTES) {
          const errors = [];
          const onErr = (m) => errors.push(m.text().slice(0, 120));
          const onPageErr = (e) => errors.push(String(e.message).split("\n")[0]);
          page.on("console", onErr);
          page.on("pageerror", onPageErr);
          try {
            await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
            await new Promise((r) => setTimeout(r, 1500));
            const res = await page.evaluate(() => ({
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              scrollbars: document.documentElement.scrollHeight > window.innerHeight * 6,
            }));
            if (res.overflow > 1) failures.push(`${vp.w}px ${loc.locale}/${loc.theme} ${route}: horizontal overflow ${res.overflow}px`);
            // Benign browser advisory (we defer prompt() to the InstallCard on purpose).
            const realErrors = errors.filter((e) => !e.includes("favicon") && !e.includes("beforeinstallprompt"));
            if (realErrors.length) failures.push(`${vp.w}px ${loc.locale}/${loc.theme} ${route}: console: ${realErrors[0]}`);
          } catch (e) {
            failures.push(`${vp.w}px ${loc.locale}/${loc.theme} ${route}: LOAD FAILED ${e.message.slice(0, 80)}`);
          } finally {
            page.off("console", onErr);
            page.off("pageerror", onPageErr);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  const total = VIEWPORTS.length * LOCALES.length * ROUTES.length;
  console.log(JSON.stringify({ checked: total, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
