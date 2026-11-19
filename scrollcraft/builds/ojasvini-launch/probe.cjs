const puppeteer = require("puppeteer-core");
const fs = require("fs");
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p));
const W = Number(process.argv[2] || 390), H = Number(process.argv[3] || 844);
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
  const page = await b.newPage();
  await page.setViewport({ width: W, height: H, isMobile: W < 640 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const act = document.querySelector('[data-sc-act="pin"]');
    const top = act.getBoundingClientRect().top + window.scrollY;
    const travel = act.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + 0.58 * travel, behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 900));
  const s = await page.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.height)]; };
    return { inner: r(".ls-demo__inner"), copy: r(".ls-demo__copy"), well: r(".ls-demo__well"), sd: r(".sd"), fit: r(".sd__fit"), design: r(".sd__design"), clip: r(".ls-demo__stage") };
  });
  console.log(W, JSON.stringify(s, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
