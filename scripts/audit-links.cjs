/**
 * Phase 10 link audit: BFS crawl of same-origin internal links from key
 * entry points (public + authenticated), asserting zero 404s and no
 * javascript:/dead actions. Usage: node scripts/audit-links.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const MAX_PAGES = 80;

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
  const seen = new Set();
  const broken = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const headers = { ...req.headers() };
      if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
      req.continue({ headers });
    });
    const queue = ["/", "/gallery", "/app/home", "/app/profile"];
    while (queue.length && seen.size < MAX_PAGES) {
      const path = queue.shift();
      if (seen.has(path)) continue;
      seen.add(path);
      let status = 0;
      let links = [];
      try {
        const res = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        status = res ? res.status() : 0;
        await new Promise((r) => setTimeout(r, 800));
        links = await page.evaluate(() =>
          [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") || "")
        );
      } catch (e) {
        broken.push(`${path}: LOAD FAILED ${String(e.message).slice(0, 80)}`);
        continue;
      }
      if (status === 404) {
        broken.push(`${path}: 404`);
        continue;
      }
      for (const href of links) {
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
        if (href.startsWith("http") && !href.startsWith(BASE)) continue; // external (wa.me etc.)
        if (href.startsWith("javascript:")) {
          broken.push(`${path}: javascript: link`);
          continue;
        }
        const clean = href.split("?")[0].split("#")[0] || "/";
        if (!seen.has(clean) && queue.length + seen.size < MAX_PAGES) queue.push(clean);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ crawled: seen.size, broken }, null, 2));
  if (broken.length) process.exit(1);
})();
