/**
 * Phase 3 acceptance: full MVP heartbeat in Hindi with mock AI.
 * Speak(type) -> Snap(upload) -> AI listing -> publish -> live storefront + OG.
 * Usage: node scripts/e2e-mvp.cjs [baseUrl]
 * Asserts the whole flow completes well under 90 seconds.
 */
const puppeteer = require("puppeteer-core");
const { writeFileSync } = require("fs");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);
const NAME = "Ghar ka aam ka achaar";

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[e2e ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);

  // A real 1x1 PNG (passes the server magic-byte check).
  writeFileSync(
    ".shots/test-achaar.png",
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    )
  );

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  // Manual cookie jar: this sandbox's Chrome stores cookies but never
  // attaches them to requests. We shuttle them explicitly so the REAL
  // server flow (OTP, CSRF, session, middleware) is exercised unchanged.
  // Login itself runs from Node (full header control); the page then rides
  // on the same jar for every navigation + fetch.
  const jar = new Map();
  async function nfetch(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
    const r = await fetch(BASE + path, { ...opts, headers, redirect: "manual" });
    const setCookies =
      typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : [];
    for (const s of setCookies) {
      const kv = s.split(";")[0];
      const i = kv.indexOf("=");
      if (i > 0) jar.set(kv.slice(0, i).trim(), kv.trim());
    }
    return r;
  }
  const fail = async (page, msg) => {
    await page.screenshot({ path: ".shots/e2e-fail.png" });
    throw new Error(msg);
  };
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem(
        "ojas-prefs",
        JSON.stringify({
          state: { locale: "hi", theme: "light", reduceMotion: false, voiceSpeed: 1, textSize: "base" },
          version: 0,
        })
      );
    });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const headers = { ...req.headers() };
      if (jar.size) headers["cookie"] = [...jar.values()].join("; ");
      req.continue({ headers });
    });
    page.on("response", async (res) => {
      const sc = res.headers()["set-cookie"];
      if (!sc) return;
      for (const part of sc.split(/,(?=[^;,]+=[^;,]*)/)) {
        const [kv] = part.split(";");
        const i = kv.indexOf("=");
        if (i > 0) jar.set(kv.slice(0, i).trim(), kv.trim());
      }
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));

    const clickText = (substr) =>
      page.evaluate((s) => {
        const els = [...document.querySelectorAll("button, a")];
        const el = els.find((e) => (e.textContent || "").includes(s));
        if (!el) return false;
        el.click();
        return true;
      }, substr);

    async function waitBody(substr, timeout, label) {
      try {
        await page.waitForFunction((s) => document.body.textContent.includes(s), { timeout }, substr);
      } catch {
        const dump = await page.evaluate(() => ({
          url: location.href,
          alert: document.querySelector('[role="alert"]')?.textContent?.slice(0, 160) || null,
          stepDots: document.querySelector('[aria-label^="Step"]')?.getAttribute("aria-label") || null,
          bodyStart: document.body.textContent.slice(0, 300),
        }));
        await page.screenshot({ path: ".shots/e2e-fail.png" });
        throw new Error(`${label}: missing ${JSON.stringify(substr)}; dump=${JSON.stringify(dump)}`);
      }
    }

    // 1. Prefs: Hindi (seeded both ways, like the real client).
    jar.set("ojas_locale", "ojas_locale=hi");
    jar.set("ojas_theme", "ojas_theme=light");

    // 2. Register+login through the exact endpoints the UI calls.
    {
      const post = (url, b) =>
        nfetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(b),
        }).then((r) => r.json());
      await post("/api/auth/otp/send", { phone: PHONE });
      const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
      if (!v.ok || !v.ticket) throw new Error("otp-verify-failed: " + (v.code || "no-ticket"));
      const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
      const form = new URLSearchParams({
        csrfToken: csrf.csrfToken,
        mode: "ticket",
        ticket: v.ticket,
        callbackUrl: "/app/create",
      });
      const cb = await nfetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const loc = cb.headers.get("location") || "";
      if (cb.status !== 302 || !loc.includes("/app/create")) {
        throw new Error(`callback failed: ${cb.status} → ${loc}`);
      }
      log(`logged in, ticket ${String(v.ticket).slice(0, 8)}…`);
    }

    // 3. Create flow: type the product name (voice path has typed fallback).
    await page.goto(`${BASE}/app/create`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[maxlength="200"]', { timeout: 15000 });
    await page.type('input[maxlength="200"]', NAME);
    if (!(await clickText("Ye bechna hai?"))) await fail(page, "confirm-name button missing");
    await new Promise((r) => setTimeout(r, 800));
    log("name confirmed");

    // 4. Photo: upload through the hidden file input (client compresses + uploads).
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) await fail(page, "file input missing");
    await fileInput.uploadFile(".shots/test-achaar.png");
    // Wait for the client pipeline (compress → upload) to finish: the tile
    // counter flips to 1/4 only after the server URL is stored.
    await page.waitForFunction(() => document.body.textContent.includes("1/4"), { timeout: 20000 });
    log("photo uploaded");
    if (!(await clickText("Aapki listing"))) await fail(page, "generate button missing");

    // 5. AI draft (mock): title in the Title input + recommended price.
    // (Input values don't appear in textContent — read the DOM value.)
    await page.waitForFunction(() => [...document.querySelectorAll("input")].some((i) => i.value.includes("अचार")), { timeout: 25000 });
    const draftState = await page.evaluate(() => ({
      title: [...document.querySelectorAll("input")].map((i) => i.value).find((v) => v.includes("अचार")) || null,
      hasPrice: document.body.textContent.includes("₹150") || document.body.textContent.includes("150"),
    }));
    if (!draftState.title || !draftState.hasPrice) await fail(page, "draft incomplete: " + JSON.stringify(draftState));
    log(`AI draft revealed (mock): ${draftState.title}`);
    if (!(await clickText("Kitne hain"))) await fail(page, "stock button missing");
    await new Promise((r) => setTimeout(r, 800));

    // 6. Publish.
    if (!(await clickText("Publish karein"))) await fail(page, "publish button missing");
    await page.waitForFunction(() => document.body.textContent.includes("Publish ho gaya"), { timeout: 20000 });
    const shopHref = await page.evaluate(() => {
      const m = document.body.textContent.match(/\/shop\/[a-z0-9-]+/);
      return m ? m[0] : null;
    });
    if (!shopHref) await fail(page, "shop link missing after publish");
    log(`published → ${shopHref}`);

    // 7. Live storefront shows the product.
    await page.goto(`${BASE}${shopHref}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("घर का आम का अचार"), { timeout: 15000 });
    log("storefront live with product");

    // 8. OG image renders.
    const slug = shopHref.split("/").pop();
    const og = await page.evaluate(async (s) => {
      const r = await fetch(`/api/og/${s}`);
      return { status: r.status, type: r.headers.get("content-type") };
    }, slug);
    if (og.status !== 200 || !(og.type || "").includes("image")) await fail(page, `OG broken: ${JSON.stringify(og)}`);
    log(`OG ok (${og.type})`);

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    const secs = (Date.now() - started) / 1000;
    console.log(JSON.stringify({ ok: true, seconds: Math.round(secs * 10) / 10, shop: shopHref }));
    if (secs > 90) throw new Error("over 90s budget");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E FAILED:", e.message);
  process.exit(1);
});
