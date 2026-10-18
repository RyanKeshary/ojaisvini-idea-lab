/** Versioned prompt: Sakhi Didi business mentor. Safety-first, grounded, empathetic. */
export function assistantPrompt(opts: { locale: string; context: string }): { system: string } {
  const { locale, context } = opts;
  const langMap: Record<string, string> = {
    hi: "Hindi (हिंदी)",
    mr: "Marathi (मराठी)",
    en: "English",
    gu: "Gujarati (ગુજરાતી)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    bn: "Bengali (বাংলা)",
  };
  const langName = langMap[locale] || "Hindi";

  const system = [
    `You are Sakhi Didi, a warm, empowering, highly knowledgeable business mentor for rural women entrepreneurs across India.`,
    `Tone: Encouraging, practical, respectful ("दीदी" / "सखी"), and friendly. Keep answers concise (under 60 words) and easy to understand.`,
    `Language: Always converse fluently in ${langName}. If the user addresses you in Roman/Latin script (Hinglish), you can reply in conversational Hinglish or simple ${langName} matching her style.`,
    `Grounded Advice: Ground your suggestions in her shop context whenever relevant:\n${context}`,
    `Action Recommendations: Whenever you recommend a specific next step, always place exactly one action tag at the very end of your response on a new line:`,
    `- For taking or improving product photos: ACTION:open-lesson|photo-1`,
    `- For pricing or profit margin guidance: ACTION:open-lesson|pricing-1`,
    `- For UPI or online payments practice: ACTION:open-lesson|upi-1`,
    `- For government business schemes/loans (MUDRA, Stand-Up India, etc.): ACTION:open-scheme|-`,
    `- For adding or listing a new product: ACTION:start-create|-`,
    `- For viewing revenue or earnings: ACTION:show-earnings|-`,
    `Only output an ACTION tag if relevant to the advice. Never add any text after the ACTION tag.`,
    `Safety: NEVER ask for, disclose, or repeat passwords, PINs, OTPs, bank accounts, or Aadhaar numbers. Never make financial guarantees. Cheer her on and build her confidence.`,
  ].join("\n");
  return { system };
}

/** Deterministic mock replies (no key): keyword-grounded, always safe. */
export function mockReply(text: string, context: string, locale: string): { reply: string; action?: { name: string; value: string } } {
  const t = text.toLowerCase();
  const say = (hi: string, mr: string, en: string, gu?: string, ta?: string) =>
    locale === "mr" ? mr : locale === "gu" ? (gu ?? hi) : locale === "ta" ? (ta ?? hi) : locale === "hi" ? hi : en;
  if (/(kamai|earning|kitna|kin|paisa|earn|kamaani|varuvaai|revenue|sales|bikri)/.test(t)) {
    const m = context.match(/revenue ₹(\d+)/);
    const rev = m ? m[1] : "0";
    return {
      reply: say(
        `Pichhle 30 din mein ₹${rev} ki bikri hui. Details dashboard par dekho!`,
        `Magil 30 divsat ₹${rev} chi vikri jhali. Tapshil dashboard var paha!`,
        `₹${rev} revenue in the last 30 days. See details on your dashboard!`,
        `Chhella 30 divasmaa ₹${rev} nu vechaan. Vigat dashboard par juo!`,
        `Kadantha 30 naatkalil ₹${rev} virpanai. Vivaram dashboard-il paar!`
      ),
      action: { name: "show-earnings", value: "-" },
    };
  }
  if (/(photo|tasveer|phoṭo|snapshot|camera|tasveerein)/.test(t)) {
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
  if (/(yojana|scheme|loan|karz|mudra|thittam|subsidy)/.test(t)) {
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
  if (/(daam|kimmat|price|rate|bhaav|vilai|munafa|margin)/.test(t)) {
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
  if (/(upi|payment|pay|online pay|scanner|qr)/.test(t)) {
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

/** Robustly parse a trailing ACTION:name|value line from a model reply. */
export function splitAction(reply: string): { text: string; action?: { name: string; value: string } } {
  const m = reply.match(/(?:\*{0,2})ACTION:\s*([a-zA-Z-]+)\s*\|\s*([^\n*]+)(?:\*{0,2})\s*$/i);
  if (!m) return { text: reply.trim() };
  const rawName = m[1].toLowerCase().trim();
  const value = m[2].trim();

  // Normalize aliases
  let normalizedName = rawName;
  if (["lesson", "open-lesson", "photo", "pricing", "upi"].includes(rawName)) normalizedName = "open-lesson";
  else if (["scheme", "open-scheme", "yojana"].includes(rawName)) normalizedName = "open-scheme";
  else if (["create", "start-create", "list", "product"].includes(rawName)) normalizedName = "start-create";
  else if (["earnings", "show-earnings", "sales", "revenue"].includes(rawName)) normalizedName = "show-earnings";

  const allowed = ["open-lesson", "open-scheme", "start-create", "show-earnings"];
  const action = allowed.includes(normalizedName) ? { name: normalizedName, value: value || "-" } : undefined;
  return { text: reply.slice(0, m.index).trim(), action };
}
