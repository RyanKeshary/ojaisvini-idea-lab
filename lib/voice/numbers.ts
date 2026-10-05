/** Indic number words → digits (Hindi + Marathi + Gujarati + Tamil). */

const WORDS: Record<string, number> = {
  // 0-10 shared + Hindi
  shunya: 0, soonya: 0, ek: 1, do: 2, teen: 3, tin: 3, chaar: 4, char: 4,
  paanch: 5, panch: 5, chhah: 6, chah: 6, saat: 7, sat: 7, aath: 8, ath: 8,
  nau: 9, dus: 10, das: 10,
  // Marathi 2-10 variants
  don: 2, paach: 5, sahaa: 6, saha: 6, daha: 10,
  // Hindi 11-19
  gyaarah: 11, baarah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16,
  satrah: 17, athaarah: 18, unnees: 19,
  // Marathi 11-19
  akraa: 11, akra: 11, baaraa: 12, baara: 12, teraa: 13, tera: 13,
  chauda: 14, chaudaa: 14, pandhra: 15, pandhraa: 15, sodaa: 16, soda: 16,
  satraa: 17, satra: 17, athraa: 18, athra: 18, ekonis: 19, ekonavis: 19,
  // Tens Hindi
  bees: 20, bis: 20, tees: 30, tis: 30, chaalees: 40, chalis: 40,
  pachaas: 50, pachas: 50, saath: 60, sath: 60, sattar: 70, assi: 80,
  nabbe: 90, navve: 90,
  // Tens Marathi variants
  vees: 20, vis: 20, pannas: 50, ainshi: 80, navvad: 90,
  // Gujarati (distinctive forms; shared 0/1/4-8 overlap with Hindi values)
  be: 2, tran: 3, nav: 9, chaalis: 40, sittar: 70, aensee: 80, nevyaanu: 90,
  // Tamil
  onru: 1, iru: 2, moonru: 3, naangu: 4, aindhu: 5, aaru: 6, ezhu: 7, ettu: 8,
  onbadhu: 9, pathu: 10, irupathu: 20, muppathu: 30, naappathu: 40, aimbathu: 50,
  arupathu: 60, ezhupathu: 70, enbathu: 80, thonnuru: 90,
};

const SCALES: Record<string, number> = {
  sau: 100, so: 100, sou: 100, shambhar: 100, shambar: 100, nooru: 100,
  hazaar: 1000, hazar: 1000, hajaar: 1000, aayiram: 1000,
  laakh: 100000, lakh: 100000,
};

/** Parse an Indic/Hinglish number phrase. Returns null when nothing numeric found. */
export function parseIndicNumber(input: string): number | null {
  const normalized = input
    .toLowerCase()
    // Glue thousand separators: "1,250" → "1250".
    .replace(/(\d),(\d)/g, "$1$2")
    // Idiom: "dedh sau" = 150.
    .replace(/\b(dedh|deedh)\s+sau\b/g, "150");
  const toks = normalized
    .replace(/₹/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
  // Direct digits win — prefer the LAST digit run (usually the price in
  // commands like "daam 150 rakho").
  for (let i = toks.length - 1; i >= 0; i--) {
    const d = toks[i].replace(/^0+(\d)/, "$1");
    if (/^\d{1,7}$/.test(d)) return parseInt(d, 10);
  }
  let total = 0;
  let current = 0;
  let found = false;
  for (const w of toks) {
    if (w in WORDS) {
      current += WORDS[w];
      found = true;
    } else if (w in SCALES) {
      current = (current || 1) * SCALES[w];
      found = true;
    }
  }
  return found ? total + current : null;
}
