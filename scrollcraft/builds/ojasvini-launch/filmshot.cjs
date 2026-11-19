/**
 * Film-section + no-JS QA shots.
 * Usage: node filmshot.cjs <W> <H> <locale> <theme> <mode:film|nojs> <out.png>
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) =>
  fs.existsSync(p)
);
(async () => {
  const [w, h, locale, theme, mode, out] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
  const page = await b.newPage();
  await page.setViewport({ width: Number(w), height: Number(h), isMobile: Number(w) < 640 });
  const prefs = { locale, theme, reduceMotion: false, voiceSpeed: 1, textSize: "base" };
  await page.setCookie(
    { name: "ojas_locale", value: locale, url: "http://localhost:3000/" },
    { name: "ojas_theme", value: theme, url: "http://localhost:3000/" },
    { name: "ojas_motion", value: "full", url: "http://localhost:3000/" }
  );
  await page.evaluateOnNewDocument((p) => {
    localStorage.setItem("ojas-prefs", JSON.stringify({ state: p, version: 0 }));
  }, prefs);
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e.message).split("\n")[0]));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200));
  });
  if (mode === "nojs") await page.setJavaScriptEnabled(false);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  if (mode === "film") {
    await page.evaluate(() => {
      const el = document.querySelector(".ls-film");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 900));
  }
  await page.screenshot({ path: out, fullPage: mode === "nojs" });
  const st = await page.evaluate(() => ({
    filmTop: Math.round(document.querySelector(".ls-film")?.getBoundingClientRect().top ?? -1),
    video: (() => { const v = document.querySelector(".ls-film video"); return v ? { src: v.currentSrc || v.src, poster: v.poster, w: v.videoWidth, h: v.videoHeight, paused: v.paused } : null; })(),
  }));
  console.log(JSON.stringify({ out, st, errors }));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
