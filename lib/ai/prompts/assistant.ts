/** Versioned prompt: Sakhi Didi business mentor. Safety-first, grounded. */
export function assistantPrompt(opts: { locale: string; context: string }): { system: string } {
  const { locale, context } = opts;
  const system = [
    "You are Sakhi Didi, a friendly business mentor for rural women entrepreneurs in India.",
    `Reply ONLY in her language (locale: ${locale}). Under 60 words. Simple everyday words.`,
    "Ground every answer in her SHOP CONTEXT below when relevant (her products, orders, earnings).",
    "You may suggest: a lesson (/app/learn), a scheme (/app/schemes), starting a listing (/app/create), or her earnings.",
    "To trigger an app action, end your reply with exactly one line: ACTION:<name>|<value>",
    "Actions: open-lesson (value: lesson key like upi-1), open-scheme (value: scheme name), start-create (value: -), show-earnings (value: -).",
    "Safety: never ask for or repeat OTP, PIN, Aadhaar, bank passwords. Refuse medical/legal/financial guarantees;",
    "redirect to her Sakhi instead. Never invent scheme amounts or eligibility — say you are not sure and point to /app/schemes.",
    "Never claim organic/FSSAI/certified about her products.",
    `SHOP CONTEXT:\n${context}`,
  ].join(" ");
  return { system };
}

/** Deterministic mock replies (no key): keyword-grounded, always safe. */
export function mockReply(text: string, context: string, locale: string): { reply: string; action?: { name: string; value: string } } {
  const t = text.toLowerCase();
  const say = (hi: string, mr: string, en: string, gu?: string, ta?: string) =>
    locale === "mr" ? mr : locale === "gu" ? (gu ?? hi) : locale === "ta" ? (ta ?? hi) : locale === "hi" ? hi : en;
  if (/(kamai|earning|kitna|kin|paisa|earn|kamaani|varuvaai)/.test(t)) {
    const m = context.match(/revenue ₹(\d+)/);
    const rev = m ? m[1] : "0";
    return {
      reply: say(
        `Pichhle 30 din mein ₹${rev} ki bikri hui. Details /app/dashboard par dekho.`,
        `Magil 30 divsat ₹${rev} chi vikri jhali. Tapshil /app/dashboard var paha.`,
        `₹${rev} revenue in the last 30 days. See details on your dashboard.`,
        `Chhella 30 divasmaa ₹${rev} nu vechaan. Vigat /app/dashboard par juo.`,
        `Kadantha 30 naatkalil ₹${rev} virpanai. Vivaram dashboard-il paar.`
      ),
      action: { name: "show-earnings", value: "-" },
    };
  }
  if (/(photo|tasveer|phoṭo|snapshot)/.test(t)) {
    return {
      reply: say(
        "Achhi photo: khidki ki roshni, saaf background, seedha phone. Lesson dekho!",
        "Changli photo: khidkicha un, swachh background, saral phone. Lesson paha!",
        "Good photos: window light, clean background, straight phone. Open the lesson!",
        "Saari photo: baarini light, saaf background, seedho phone. Lesson juo!",
        "Nalla photo: jannal velichcham, suthamana background, neraana phone. Paadam thira!"
      ),
      action: { name: "open-lesson", value: "photo-1" },
    };
  }
  if (/(yojana|scheme|loan|karz|mudra|thittam)/.test(t)) {
    return {
      reply: say(
        "Scheme Finder mein Match karo — sirf wahi yojana jo tumhe milegi.",
        "Scheme Finder madhye Match kara — fakt tyach yojana jya tumhala miltil.",
        "Use Match me in the Scheme Finder — only schemes you can actually get.",
        "Scheme Finder maa Match karo — fakt ej yojana je tamane malshe.",
        "Scheme Finder-il Match sei — unakku kidaikkakkudiyavai mattum."
      ),
      action: { name: "open-scheme", value: "-" },
    };
  }
  if (/(daam|kimmat|price|rate|bhaav|vilai)/.test(t)) {
    return {
      reply: say(
        "Daam = laagat + 30–50% munafa. Aas-paas ka bazaar check karo, sabse saste mat bano.",
        "Kimmat = kharch + 30–50% napha. Jawalcha bazaar tapasa, sarvat swast naka.",
        "Price = cost + 30–50% margin. Check nearby rates; don't be the cheapest.",
        "Bhaav = kharch + 30–50% nafo. Najiknu bazaar tapaso, sauthi sastaa na bano.",
        "Vilai = selavu + 30–50% laabam. Arugil sandhai paar; migavum malivaaga vendam."
      ),
      action: { name: "open-lesson", value: "pricing-1" },
    };
  }
  if (/(upi|payment|pay)/.test(t)) {
    return {
      reply: say(
        "UPI practice lesson mein nakli paise se seekho — koi risk nahin.",
        "UPI practice lesson madhye khotya paishanni shika — kahi risk nahi.",
        "Learn with fake money in the UPI practice lesson — zero risk.",
        "UPI practice lesson maa nakli paisaathi sheekho — koi risk nahin.",
        "UPI practice lesson-il poli panaththaal katru — risk illai."
      ),
      action: { name: "open-lesson", value: "upi-1" },
    };
  }
  return {
    reply: say(
      "Main Sakhi Didi hoon — daam, photo, UPI, yojana poocho. Pakka jawab dungi ya sahi jagah bhejungi.",
      "Mi Sakhi Didi aahe — kimmat, photo, UPI, yojana vichara. Nakki uttar dein kiwa yogya thikani pathven.",
      "I'm Sakhi Didi — ask about pricing, photos, UPI, schemes. I'll answer or point you right.",
      "Hu Sakhi Didi chhu — bhaav, photo, UPI, yojana puchho. Pakko javaab aapish ke saachi jagyae moklish.",
      "Naan Sakhi Didi — vilai, photo, UPI, thittangal kelu. Urudhiyaaga badhil solluven alladhu sariyaana idathukku anuppuven."
    ),
  };
}

/** Parse a trailing ACTION:name|value line from a model reply. */
export function splitAction(reply: string): { text: string; action?: { name: string; value: string } } {
  const m = reply.match(/ACTION:([a-z-]+)\|([^\n]*)\s*$/);
  if (!m) return { text: reply.trim() };
  const allowed = ["open-lesson", "open-scheme", "start-create", "show-earnings"];
  const action = allowed.includes(m[1]) ? { name: m[1], value: m[2].trim() } : undefined;
  return { text: reply.slice(0, m.index).trim(), action };
}
