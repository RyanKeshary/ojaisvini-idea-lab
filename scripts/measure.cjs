/** One-off: measure computed heading sizes + rail layout in the running app. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const chrome = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p));

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const origin = "http://localhost:3000";
  const jar = new Map();
  async function nfetch(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
    const r = await fetch(origin + path, { ...opts, headers, redirect: "manual" });
    const sc = typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : [];
    for (const s of sc) {
      const kv = s.split(";")[0];
      const i = kv.indexOf("=");
      if (i > 0) jar.set(kv.slice(0, i).trim(), kv.trim());
    }
    return r;
  }
  const post = (u, bd) => nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(bd) }).then((r) => r.json());
  await post("/api/auth/otp/send", { phone: "9820000001" });
  const vv = await post("/api/auth/otp/verify", { phone: "9820000001", otp: "123456", create: "1" });
  if (!vv.ok) throw new Error("login failed");
  const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
  await nfetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: vv.ticket, callbackUrl: "/app/home" }).toString(),
  });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const headers = { ...req.headers() };
    if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
    req.continue({ headers });
  });
  await page.setCookie({ name: "ojas_locale", value: "en", url: origin }, { name: "ojas_theme", value: "light", url: origin }, { name: "ojas_motion", value: "full", url: origin });
  await page.evaluateOnNewDocument(() => localStorage.setItem("ojas-prefs", JSON.stringify({ state: { locale: "en", theme: "light", reduceMotion: false, voiceSpeed: 1, textSize: "base" }, version: 0 })));
  await page.goto(origin + "/app/home", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  const out = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("[data-surface=app] h1,[data-surface=app] h2,[data-surface=app] h3,[data-surface=app] h4,[data-surface=app] h5")].map((h) => ({ tag: h.tagName, fs: getComputedStyle(h).fontSize, surface: h.closest("[data-surface]")?.getAttribute("data-surface"), t: (h.textContent || "").trim().slice(0, 28) }));
    const rail = document.querySelector('nav[aria-label="Primary"]');
    const rr = rail?.getBoundingClientRect();
    const chip = rail?.querySelector("div:last-child > div:last-child");
    const cr = chip?.getBoundingClientRect();
    const nudge = rail?.querySelector(".nudge-in");
    return {
      headings,
      rail: rr ? { top: Math.round(rr.top), bottom: Math.round(rr.bottom), scrollH: rail.scrollHeight, clientH: rail.clientHeight, chipBottom: cr ? Math.round(cr.bottom) : null, nudge: !!nudge } : null,
      surfaceApp: !!document.querySelector("[data-surface=app]"),
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
