/**
 * Deterministic visual-QA screenshots.
 * Usage: node scripts/shot.cjs <url> <out.png> <viewportW> <viewportH> <locale> <theme> <motion:full|reduced> [waitMs] [fullPage] [loginPhone]
 * Seeds the ojas-prefs localStorage before load so locale/theme/motion are exact.
 * (Prefs are built in Node from plain tokens to avoid shell quoting issues.)
 * loginPhone: optional — performs a real demo-OTP login (Node side) and rides
 * the session on every request, so protected routes render authenticated.
 */
const puppeteer = require("puppeteer-core");

(async () => {
  const [url, out, w, h, locale = "mr", theme = "light", motion = "full", waitMs = "2500", full = "1", loginPhone = ""] =
    process.argv.slice(2);
  const prefs = { locale, theme, reduceMotion: motion === "reduced", voiceSpeed: 1, textSize: "base" };
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: Number(w), height: Number(h), isMobile: Number(w) < 640 });
    const origin = new URL(url).origin;
    // Optional authenticated session (same endpoints the UI calls). The manual
    // jar rides on every request because this sandbox's Chrome never attaches
    // cookies itself.
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
    if (loginPhone) {
      const post = (u, b) =>
        nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
      let ticket;
      if (loginPhone.includes("@")) {
        // Staff login (Sakhi/Admin demo accounts).
        const vv = await post("/api/auth/staff/verify", { email: loginPhone, password: "demo1234" });
        if (!vv.ok || !vv.ticket) throw new Error("shot login failed");
        ticket = vv.ticket;
      } else {
        await post("/api/auth/otp/send", { phone: loginPhone });
        const vv = await post("/api/auth/otp/verify", { phone: loginPhone, otp: "123456", create: "1" });
        if (!vv.ok || !vv.ticket) throw new Error("shot login failed");
        ticket = vv.ticket;
      }
      const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
      const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket, callbackUrl: "/app/home" });
      await nfetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const headers = { ...req.headers() };
        if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
        req.continue({ headers });
      });
    }
    // Mirror prefs the way the real client does: localStorage + cookies,
    // so SSR HTML and hydrated UI agree on first paint.
    await page.setCookie(
      { name: "ojas_locale", value: locale, url },
      { name: "ojas_theme", value: theme, url },
      { name: "ojas_motion", value: motion === "reduced" ? "reduced" : "full", url }
    );
    await page.evaluateOnNewDocument((p) => {
      localStorage.setItem("ojas-prefs", JSON.stringify({ state: p, version: 0 }));
    }, prefs);
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e.message).split("\n")[0]));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push("console: " + m.text().slice(0, 220));
    });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, Number(waitMs)));
    await page.screenshot({ path: out, fullPage: full === "1" });
    // Bottom-anchored viewport shot: proves fixed-nav clearance without the
    // fullPage fixed-element stitch artifact.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 600));
    const bottomOut = out.replace(/\.png$/, "-bottom.png");
    await page.screenshot({ path: bottomOut });
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      locale: document.documentElement.dataset.locale,
      theme: document.documentElement.dataset.theme,
      motion: document.documentElement.dataset.motion,
      fonts: [...new Set([...document.fonts].map((f) => `${f.family} ${f.status}`))].slice(0, 20),
    }));
    console.log(JSON.stringify({ out, state, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
