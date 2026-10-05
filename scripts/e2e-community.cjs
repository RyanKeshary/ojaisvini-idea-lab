/**
 * Phase 6 acceptance: ask by text -> reply -> mark best -> translate.
 * Usage: node scripts/e2e-community.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);
const QUESTION = `Papad business sathi konta tel changla? (${String(Date.now()).slice(-6)})`;

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[forum ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
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
    await page.screenshot({ path: ".shots/e2e-community-fail.png" });
    throw new Error(msg);
  };
  try {
    const post = (u, b) =>
      nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: PHONE });
    const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    if (!v.ok || !v.ticket) throw new Error("login failed");
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/community" });
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

    await page.goto(`${BASE}/app/community`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Community"), { timeout: 15000 });
    log("feed renders (seeded posts)");

    // Open its thread (unique tail), reply, mark best.

    // Composer: ask a question.
    if (!(await clickText("Ask / Share"))) await fail(page, "composer button missing");
    await page.waitForFunction(() => document.body.textContent.includes("Your question"), { timeout: 10000 });
    await page.type("#post-box", QUESTION);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Post").click();
    });
    // Real publish closes the composer AND clears the draft (not just textarea text).
    await page.waitForFunction(() => !document.querySelector("#post-box"), { timeout: 15000 });
    await page.waitForFunction((q) => [...document.querySelectorAll("article")].some((a) => (a.textContent || "").includes(q)), { timeout: 15000 }, QUESTION);
    log("question posted");

    // Open its thread, reply, mark best. Match the UNIQUE timestamp tail —
    // a short slice would hit older runs' identical questions.
    const tail = QUESTION.slice(-7, -1);
    await page.evaluate((t) => {
      [...document.querySelectorAll("a")].find((a) => (a.textContent || "").includes(t)).click();
    }, tail);
    await page.waitForFunction(() => !!document.querySelector("#reply-box"), { timeout: 15000 });
    await page.evaluate((txt) => {
      const el = document.querySelector("#reply-box");
      if (!el) throw new Error("reply box missing");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(el, txt);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, "Shengdana tel vapra, chav changli yete.");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Reply").click();
    });
    await page.waitForFunction(() => [...document.querySelectorAll("article")].some((a) => (a.textContent || "").includes("Shengdana")), { timeout: 15000 });
    log("reply posted");
    try {
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("Mark best")), { timeout: 10000 });
    } catch {
      const d = await page.evaluate(async () => {
        const id = location.pathname.split("/").pop();
        const det = await fetch(`/api/community/${id}`).then((x) => x.json());
        const sess = await fetch("/api/auth/session").then((x) => x.json());
        return {
          mine: det.post?.mine,
          author: det.post?.author,
          sessionUser: sess?.user?.id,
          sessionPhone: sess?.user?.phone,
        };
      });
      await fail(page, "no mark-best; truth=" + JSON.stringify(d));
    }
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Mark best")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Best answer"), { timeout: 15000 });
    log("best answer marked");

    // Translate + summarize run without errors.
    await clickText("Translate");
    await new Promise((r) => setTimeout(r, 2500));
    await clickText("Summarize");
    await new Promise((r) => setTimeout(r, 2500));
    log("translate + summarize ok");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    console.log(JSON.stringify({ ok: true, seconds: Math.round(((Date.now() - started) / 1000) * 10) / 10 }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-COMMUNITY FAILED:", e.message);
  process.exit(1);
});
