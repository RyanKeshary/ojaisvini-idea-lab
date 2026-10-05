/**
 * Phase 8 acceptance (F8): offline-tolerant create loop.
 * A) Offline at photo step -> raw draft saved to IDB -> online -> restored -> publish LIVE.
 * B) Draft reviewed online -> offline publish -> queued -> reconnect -> auto-published.
 * Usage: node scripts/e2e-offline.cjs [baseUrl]
 */
const puppeteer = require("puppeteer-core");
const { writeFileSync } = require("fs");

const BASE = process.argv[2] || "http://localhost:3102";
const PHONE = "98" + String(Date.now()).slice(-8);

(async () => {
  const started = Date.now();
  const log = (m) => console.log(`[offline ${((Date.now() - started) / 1000).toFixed(1)}s] ${m}`);
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
    await page.screenshot({ path: ".shots/e2e-offline-fail.png" });
    throw new Error(msg);
  };
  try {
    writeFileSync(".shots/test-offline.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
    const post = (u, b) =>
      nfetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());
    await post("/api/auth/otp/send", { phone: PHONE });
    const v = await post("/api/auth/otp/verify", { phone: PHONE, otp: "123456", create: "1" });
    if (!v.ok) throw new Error("login failed");
    const csrf = await nfetch("/api/auth/csrf").then((r) => r.json());
    const form = new URLSearchParams({ csrfToken: csrf.csrfToken, mode: "ticket", ticket: v.ticket, callbackUrl: "/app/create" });
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
    const idbGet = (dbName, store, key) =>
      page.evaluate(async (dbN, st, k) => {
        const db = await new Promise((res, rej) => {
          const q = indexedDB.open(dbN);
          q.onsuccess = () => res(q.result);
          q.onerror = () => rej(q.error);
        });
        return new Promise((res, rej) => {
          const tx = db.transaction(st).objectStore(st).get(k);
          tx.onsuccess = () => res(tx.result ? JSON.stringify(tx.result).slice(0, 200) : null);
          tx.onerror = () => rej(tx.error);
        });
      }, dbName, store, key);
    const idbCount = () =>
      page.evaluate(async () => {
        const db = await new Promise((res, rej) => {
          const q = indexedDB.open("ojas");
          q.onsuccess = () => res(q.result);
          q.onerror = () => rej(q.error);
        });
        return new Promise((res, rej) => {
          const tx = db.transaction("outbox").objectStore("outbox").getAll();
          tx.onsuccess = () => res(tx.result.length);
          tx.onerror = () => rej(tx.error);
        });
      });

    // ---- Path A: offline raw draft ----
    await page.goto(`${BASE}/app/create`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#create-name", { timeout: 15000 });
    await page.type("#create-name", "Offline Tokri Test");
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Sell this")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Take product photos"), { timeout: 15000 });
    await page.setOfflineMode(true);
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(".shots/test-offline.png");
    await page.waitForFunction(() => [...document.querySelectorAll("img")].length > 0, { timeout: 20000 });
    // Wait until the photo pipeline (compress) finishes: generate enabled.
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("Your listing") && !b.disabled), { timeout: 20000 });
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Your listing")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Draft saved"), { timeout: 15000 });
    const draft = await idbGet("ojas-drafts", "drafts", "create-v1");
    if (!draft || !draft.includes("Offline Tokri")) await fail(page, "IDB draft missing: " + draft);
    log("offline raw draft saved to IDB");

    // Reconnect: draft restores AT THE PHOTO STEP (transcript lives in state
    // and photos re-upload; the transcript text itself isn't shown on step 1).
    await page.setOfflineMode(false);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.textContent.includes("Take product photos"), { timeout: 20000 });
    await page.waitForFunction(() => [...document.querySelectorAll("img")].length > 0, { timeout: 20000 });
    const afterReload = await page.evaluate(() => ({
      dots: document.querySelector('[aria-label^="Step"]')?.getAttribute("aria-label") || null,
    }));
    console.log("after-reload:", JSON.stringify(afterReload));
    log("draft restored after reconnect");
    try {
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes("Your listing") && !b.disabled), { timeout: 20000 });
    } catch {
      const d = await page.evaluate(() => ({
        imgs: document.querySelectorAll("img").length,
        genBtns: [...document.querySelectorAll("button")].filter((b) => (b.textContent || "").includes("Your listing")).map((b) => ({ dis: b.disabled, txt: (b.textContent || "").slice(0, 30) })),
        alert: document.querySelector('[role="alert"]')?.textContent?.slice(0, 150) || null,
        online: navigator.onLine,
      }));
      await fail(page, "generate never enabled; dump=" + JSON.stringify(d));
    }
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Your listing")).click();
    });
    await page.waitForFunction(
      () => [...document.querySelectorAll("input")].some((i) => i.value.includes("Offline Tokri")),
      { timeout: 30000 }
    );
    log("AI draft generated after reconnect (transcript survived)");

    // ---- Path B: reviewed draft + offline publish -> queued -> auto LIVE ----
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes("How many")).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("Publish"), { timeout: 15000 });
    await page.setOfflineMode(true);
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Publish").click();
    });
    await page.waitForFunction(() => document.body.textContent.includes("My products") || document.body.textContent.includes("auto"), { timeout: 20000 });
    const queued = await idbCount();
    if (queued < 1) await fail(page, "publish not queued");
    log(`publish queued (${queued})`);
    await page.setOfflineMode(false);
    // Auto-flush on 'online' -> poll seller products for the offline item.
    let found = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const list = await nfetch("/api/products").then((r) => r.json()).catch(() => null);
      if (list?.products?.some((p) => p.title.includes("Offline Tokri"))) {
        found = true;
        break;
      }
    }
    if (!found) await fail(page, "queued publish never went LIVE");
    log("queued publish auto-synced LIVE");

    if (errors.length) await fail(page, "page errors: " + errors.join(" | "));
    console.log(JSON.stringify({ ok: true, seconds: Math.round(((Date.now() - started) / 1000) * 10) / 10 }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("E2E-OFFLINE FAILED:", e.message);
  process.exit(1);
});
