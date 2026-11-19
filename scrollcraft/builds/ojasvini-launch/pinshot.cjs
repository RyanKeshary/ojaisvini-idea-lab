/** Pin-section QA: scroll the #demo act to given progress values and shoot. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => fs.existsSync(p));

const PS = (process.argv[2] || "0,0.28,0.42,0.58,0.7,0.85").split(",").map(Number);
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const LOCALE = process.argv[5] || "en";
const THEME = process.argv[6] || "light";
const PREFIX = process.argv[7] || "/tmp/scrollcraft-qa/pin/pin";

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, isMobile: W < 640 });
  const url = "http://localhost:3000/";
  await page.setCookie(
    { name: "ojas_locale", value: LOCALE, url },
    { name: "ojas_theme", value: THEME, url },
    { name: "ojas_motion", value: "full", url }
  );
  await page.evaluateOnNewDocument((p) => localStorage.setItem("ojas-prefs", JSON.stringify({ state: p, version: 0 })), { locale: LOCALE, theme: THEME, reduceMotion: false, voiceSpeed: 1, textSize: "base" });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e.message).split("\n")[0]));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  for (const p of PS) {
    const y = await page.evaluate((prog) => {
      const act = document.querySelector('[data-sc-act="pin"]');
      if (!act) return null;
      const top = act.getBoundingClientRect().top + window.scrollY;
      const travel = act.getBoundingClientRect().height - window.innerHeight;
      window.scrollTo(0, top + prog * travel);
      return top + prog * travel;
    }, p);
    await new Promise((r) => setTimeout(r, 900));
    const state = await page.evaluate(() => {
      const act = document.querySelector('[data-sc-act="pin"]');
      const stage = document.querySelector(".sd__design");
      const cursor = document.querySelector(".sd__design .ss-cursor");
      return {
        p: act ? act.style.getPropertyValue("--sc-p") : "no-act",
        fit: stage ? [Math.round(stage.getBoundingClientRect().width), Math.round(stage.getBoundingClientRect().height)] : null,
        cursor: cursor ? cursor.style.transform : null,
        screen: document.querySelector(".sd-hd--form") ? "form" : "home",
        rows: document.querySelectorAll(".sd-list .ss-row").length,
        order: !!document.querySelector(".sd-order:not(.sd-order--idle)"),
        sat: document.querySelector(".sd-sat")?.textContent?.slice(0, 24) || null,
      };
    });
    const out = `${PREFIX}-p${String(p).replace(".", "")}.png`;
    await page.screenshot({ path: out });
    console.log(out, JSON.stringify(state));
  }
  console.log(JSON.stringify({ errors }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
