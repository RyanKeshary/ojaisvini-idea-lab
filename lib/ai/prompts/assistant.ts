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
    `You are Sakhi Didi, a dynamic, warm, highly intelligent and empathetic AI business mentor for rural women micro-entrepreneurs.`,
    `Personality & Style: You converse naturally, proactively, and supportively like an experienced elder sister and mentor ("दीदी" / "सखी"). Never give rigid, robotic, or repetitive answers. Each reply should be fresh, thoughtful, and personalized.`,
    `Conversational Depth: Provide realistic, actionable advice (typically 2-4 well-structured paragraphs or bullet points). Always include real-life examples and ask an engaging follow-up question to keep learning about her business goals.`,
    `Language: Always converse fluently and natively in ${langName}. If locale is 'mr' (Marathi), use authentic, respectful Marathi in Devanagari script. If 'hi' (Hindi), use natural Hindi in Devanagari script. If 'en' (English), use clear, encouraging English.`,
    `Grounded Advice: Ground your suggestions in her actual shop data whenever relevant:\n${context}`,
    `Action Recommendations: Whenever you recommend a specific next step, always place exactly one action tag at the very end of your response on a new line:`,
    `- For taking or improving product photos: ACTION:open-lesson|photo-1`,
    `- For pricing or profit margin guidance: ACTION:open-lesson|pricing-1`,
    `- For UPI or online payments practice: ACTION:open-lesson|upi-1`,
    `- For government business schemes/loans (MUDRA, Stand-Up India, Lakhpati Didi): ACTION:open-scheme|-`,
    `- For adding or listing a new product: ACTION:start-create|-`,
    `- For viewing revenue or earnings: ACTION:show-earnings|-`,
    `Only output an ACTION tag if relevant to the advice. Never add any text after the ACTION tag.`,
    `Safety: NEVER ask for, disclose, or repeat passwords, PINs, OTPs, bank accounts, or Aadhaar numbers. Never make financial guarantees. Cheer her on and build her confidence!`,
  ].join("\n");
  return { system };
}

/** Deterministic mock replies (no key or fallback): keyword-grounded, empathetic, multilingual. */
export function mockReply(text: string, context: string, locale: string): { reply: string; action?: { name: string; value: string } } {
  const t = text.toLowerCase().trim();
  const say = (hi: string, mr: string, en: string, gu?: string, ta?: string) =>
    locale === "mr" ? mr : locale === "gu" ? (gu ?? hi) : locale === "ta" ? (ta ?? hi) : locale === "hi" ? hi : en;

  // Greetings & welcomes
  if (/^(hey|hello|hi|hii|helo|namaste|namaskar|kem cho|vanakkam|salam|pranam|ram ram|shubhadin)/.test(t) || t === "hey" || t === "hi" || t === "hello") {
    return {
      reply: say(
        "नमस्ते दीदी! मैं सखी दीदी हूँ. आज आपके व्यवसाय में मैं क्या सहायता करूँ? आप मुझसे सामान की सही कीमत, फोटो, WhatsApp पर बिक्री या सरकारी योजनाओं के बारे में पूछ सकती हैं!",
        "नमस्कार! मी सखी दीदी, तुमची व्यवसाय मार्गदर्शक. आज तुमच्या व्यवसायासाठी मी काय मदत करू? तुम्ही मला उत्पादन किंमत, फोटो काढणे, पहिली ऑर्डर कशी मिळवायची किंवा सरकारी योजनांबद्दल विचारू शकता!",
        "Hello! I am Sakhi Didi, your personal business mentor. How can I help your micro-enterprise today? Ask me about setting prices, photos, WhatsApp selling, or government schemes!",
        "નમસ્તે! હું સખી દીદી છું. આજે તમારા બિઝનેસમાં હું શું મદદ કરું? તમે મને ભાવ, ફોટો, WhatsApp વેચાણ કે સરકારી યોજનાઓ વિશે પૂછી શકો છો!",
        "Vanakkam! Naan Sakhi Didi. Ungal thozhilukku naan enna udhavi seiyattum? Vilai, photo, WhatsApp virpanai patri kelungal!"
      ),
      action: { name: "open-lesson", value: "pricing-1" },
    };
  }

  // Help / Questions / Guidance
  if (t === "?" || /^(help|madad|kya karu|kay karu|guide|guidance|kya karein|start|shuruat)/.test(t)) {
    return {
      reply: say(
        "घबराइए मत दीदी, शुरुआत करना बहुत आसान है! १. उत्पाद का साफ़ फोटो जोड़ें. २. UPI पेमेंट का अभ्यास करें. ३. सरकारी योजनाएं देखें. आप कहाँ से शुरू करना चाहती हैं?",
        "काळजी करू नका, सुरुवात करणे अगदी सोपे आहे! १. उत्पादनाचा फोटो जोडा. २. UPI पेमेंटचा सराव करा. ३. सरकारी योजना शोधा. आपण कुठून सुरुवात करायची?",
        "Don't worry, taking the first step is easy! 1. Add your product with photo. 2. Practice UPI payments. 3. Find government schemes. Where would you like to begin?",
        "ચિંતા ન કરશો, શરૂઆત કરવી ખૂબ સરળ છે! ૧. પ્રોડક્ટનો ફોટો ઉમેરો. ૨. UPI પેમેન્ટ શીખો. ૩. સરકારી યોજનાઓ જુઓ. ક્યાંથી શરૂ કરીએ?",
        "Kavalai vendaam, thodanguvadhu elidhu! 1. Porul photo ser. 2. UPI pazhagu. 3. Thittangal paar. Engirundhu thodangalaam?"
      ),
      action: { name: "start-create", value: "-" },
    };
  }

  // Pickle / Food / Cooking / Handicrafts
  if (/(pickle|achar|lonche|papad|masala|food|khana|jevan|laddu|sweets|mithai|handicraft|silai|tailoring|saree|cloth)/.test(t)) {
    return {
      reply: say(
        "अचार और खाद्य पदार्थों के लिए डिब्बा हमेशा एयरटाइट रखें और बनाने की तारीख लिखें. सामग्री और अपनी मेहनत जोड़कर ३५–४५% मार्जिन पर दाम रखें!",
        "लोणचे आणि खाद्यपदार्थांसाठी हवाबंद बरणी वापरा आणि बनवल्याची तारीख नक्की टाका. साहित्य आणि तुमची मेहनत धरून ३५–४५% नफा ठेवून किंमत ठरवा!",
        "For food and pickles, make sure jars are airtight with the preparation date. Price it with a 35–45% margin to cover ingredients and your labor!",
        "અથાણાં અને ખાધ્ય પદાર્થો માટે હવાચુસ્ત બરણી વાપરો અને તારીખ લખો. સામગ્રી અને મહેનત ગણીને ૩૫–૪૫% નફા સાથે ભાવ નક્કી કરો!",
        "Oorugai matrum unavugalukku kaatru pugadha moodi payanpaduthavum. Selavu matrum ungal uzhaippudan 35-45% laabam vaithu vilai nirnayam seiyavum!"
      ),
      action: { name: "open-lesson", value: "pricing-1" },
    };
  }

  // First order / Customers / Selling
  if (/(first order|pehli order|pahili order|order|customer|grahak|bikri|virpanai|vechan|biko|sell)/.test(t)) {
    return {
      reply: say(
        "पहिला ऑर्डर पाने के लिए: अपनी दुकान की लिंक अपने परिवार और मोहल्ले के WhatsApp ग्रुप में भेजें, चखने के लिए थोड़ा सैंपल दें और ताज़ा माल का भरोसा दें!",
        "पहिली ऑर्डर मिळवण्यासाठी: तुमच्या दुकानची लिंक कौटुंबिक आणि गावातील WhatsApp ग्रुपवर पाठवा, शेजाऱ्यांना चव चाखायला द्या आणि ताजे उत्पादन देण्याचे सांगा!",
        "To get your first order: share your shop link in neighborhood WhatsApp groups, offer a small tasting sample, and tell everyone you deliver fresh!",
        "પહેલો ઓર્ડર મેળવવા માટે: તમારી દુકાનની લિંક WhatsApp ગ્રૂપમાં શેર કરો, થોડું સેમ્પલ આપો અને તાજા માલનો વિશ્વાસ આપો!",
        "Mudhal order pera: ungal kadai link-ai WhatsApp groups-il share seiyavum, sample koduthu fresh-aana porul enru nambikkai alikkavum!"
      ),
      action: { name: "start-create", value: "-" },
    };
  }

  // WhatsApp commerce
  if (/(whatsapp|status|group|share|link)/.test(t)) {
    return {
      reply: say(
        "अपने उत्पाद के साफ़ फोटो और सही दाम अपने WhatsApp स्टेटस और ग्रुप्स में शेयर करें. लोग जान-पहचान की दीदियों से बहुत भरोसे से सामान खरीदते हैं!",
        "तुमच्या उत्पादनाचे सुंदर फोटो आणि स्पष्ट किंमत WhatsApp स्टेटस आणि ग्रुप्सवर टाका. ओळखीच्या लोकांकडून लोक विश्वासाने खरेदी करतात!",
        "Post attractive photos and clear prices on your WhatsApp Status and local groups with your direct shop link. People love buying from someone they trust!",
        "તમારા પ્રોડક્ટના સુંદર ફોટા અને સાચો ભાવ WhatsApp સ્ટેટસ અને ગ્રૂપમાં શેર કરો. ઓળખીતા લોકો પાસેથી ગ્રાહકો ખૂબ વિશ્વાસથી ખરીદે છે!",
        "Ungal porulin azhagiya photo matrum vilaiyai WhatsApp Status matrum groups-il share seiyavum. Nambikkaiyaana aatkalidam virpanai adhigam nadakkum!"
      ),
      action: { name: "start-create", value: "-" },
    };
  }

  // Earnings & Revenue
  if (/(kamai|earning|kitna|kin|paisa|earn|kamaani|varuvaai|revenue|sales|munafa)/.test(t)) {
    const m = context.match(/revenue ₹(\d+)/);
    const rev = m ? m[1] : "0";
    return {
      reply: say(
        `पिछले ३० दिनों में ₹${rev} की बिक्री हुई है. विस्तृत ब्यौरा अपने डैशबोर्ड पर देखें!`,
        `मागील ३० दिवसांत ₹${rev} ची विक्री झाली आहे. सविस्तर तपशील तुमच्या डॅशबोर्डवर पहा!`,
        `You have generated ₹${rev} in revenue over the last 30 days. See full details on your dashboard!`,
        `છેલ્લા ૩૦ દિવસમાં ₹${rev} નું વેચાણ થયું છે. વિગત ડેશબોર્ડ પર જુઓ!`,
        `Kadantha 30 naatkalil ₹${rev} virpanai nadandhulladhu. Vivarangalai dashboard-il paarungal!`
      ),
      action: { name: "show-earnings", value: "-" },
    };
  }

  // Photo guidance
  if (/(photo|tasveer|phoṭo|snapshot|camera|tasveerein|chabi)/.test(t)) {
    return {
      reply: say(
        "अच्छी फोटो के नियम: खिड़की की प्राकृतिक रोशनी, साफ़ और सादा बैकग्राउंड, और फोन को सीधा रखें. फोटो का पाठ देखें!",
        "उत्तम फोटोसाठी: खिडकीचा नैसर्गिक प्रकाश, स्वच्छ साधी पार्श्वभूमी आणि फोन स्थिर धरा. फोटो धडा नक्की पहा!",
        "Good photo tips: use natural window light, a clean neutral background, and hold the phone steady. Open the lesson!",
        "સારી ફોટો માટે: બારીનો કુદરતી પ્રકાશ, સાફ બેકગ્રાઉન્ડ અને ફોન સીધો રાખો. ફોટો લેસન જુઓ!",
        "Nalla photo edukka: jannal iyarkai velicham, suthamana background matrum neraana phone. Paadam thiravum!"
      ),
      action: { name: "open-lesson", value: "photo-1" },
    };
  }

  // Schemes & Loans
  if (/(yojana|scheme|loan|karz|mudra|thittam|subsidy|grant|shg|bachat)/.test(t)) {
    return {
      reply: say(
        "प्रधानमंत्री मुद्रा योजना और लखपति दीदी योजना आपके लिए बहुत मददगार हैं. केवल वही योजनाएं देखने के लिए नीचे मैच पर टैप करें!",
        "पंतप्रधान मुद्रा योजना आणि लखपती दीदी योजना तुमच्यासाठी फायदेशीर आहेत. केवळ पात्र योजना पाहण्यासाठी खाली टॅप करा!",
        "Pradhan Mantri MUDRA Yojana and Lakhpati Didi schemes are great options. Tap below to find the schemes you qualify for!",
        "પ્રધાનમંત્રી મુદ્રા યોજના અને લખપતિ દીદી યોજના તમારા માટે ઉત્તમ છે. લાયક યોજનાઓ જોવા નીચે ટેપ કરો!",
        "Pradhan Mantri MUDRA matrum Lakhpati Didi thittangal migavum nalladhu. Neengal thagudhiyaana thittangalai kaana keezhe thodavum!"
      ),
      action: { name: "open-scheme", value: "-" },
    };
  }

  // Price & Margin
  if (/(daam|kimmat|price|rate|bhaav|vilai|margin|profit|laagat|kharch)/.test(t)) {
    return {
      reply: say(
        "दाम = कच्चा माल + पैकिंग + आपकी मेहनत + ३०–५०% मुनाफा. कभी भी सिर्फ़ सस्ता बेचने के लिए अपने हुनर की कीमत कम मत आंकिए!",
        "किंमत = साहित्य खर्च + पॅकिंग + तुमचा वेळ + ३०–५०% नफा. केवळ स्वस्त विकण्याच्या नादात तुमच्या मेहनतीचे मूल्य कमी करू नका!",
        "Price = ingredients + packaging + your time + 30–50% profit margin. Never underprice your hard work just to be cheap!",
        "ભાવ = કાચો માલ + પેકિંગ + તમારી મહેનત + ૩૦–૫૦% નફો. ફક્ત સસ્તું વેચવા માટે તમારી મહેનતને ઓછી ન આંકશો!",
        "Vilai = selavu + packing + ungal uzhaippu + 30-50% laabam. Migavum malivaaga virka vendam!"
      ),
      action: { name: "open-lesson", value: "pricing-1" },
    };
  }

  // UPI & Payments
  if (/(upi|payment|pay|online pay|scanner|qr|bank|khata)/.test(t)) {
    return {
      reply: say(
        "UPI बहुत सुरक्षित और आसान है. हमारे अभ्यास पाठ में बिना किसी डर के डमी पैसों से सीखें ताकि आप भरोसे से पेमेंट ले सकें!",
        "UPI सुरक्षित आणि सोपे आहे. आमच्या सराव पाठात डमी पैशांनी सराव करा, जेणेकरून आत्मविश्वासाने पेमेंट स्वीकारता येईल!",
        "UPI is safe, instant, and reliable. Practice with demo coins in our interactive lesson so you can accept payments with total confidence!",
        "UPI એકદમ સલામત અને સરળ છે. અમારા પ્રેક્ટિસ પાઠમાં ડમી પૈસાથી શીખો જેથી આત્મવિશ્વાસથી પેમેન્ટ સ્વીકારી શકો!",
        "UPI migavum paadhukaappaanadhu matrum elidhaanadhu. Engal payirchi paadathil poli panathudan pazhagi thunivu pera!"
      ),
      action: { name: "open-lesson", value: "upi-1" },
    };
  }

  // Packaging & Delivery
  if (/(pack|packing|delivery|box|label|courier|dabba)/.test(t)) {
    return {
      reply: say(
        "साफ़-सुथरे डिब्बे या पाउच का उपयोग करें और उस पर अपने ब्रांड और फोन नंबर का छोटा स्टिकर लगाएं. इससे ग्राहकों का भरोसा बढ़ता है!",
        "स्वच्छ पाऊच किंवा बरणी वापरा आणि त्यावर तुमचे नाव व फोन नंबरचे छोटे लेबल लावा. यामुळे ग्राहकांचा विश्वास वाढतो!",
        "Use clean pouches or airtight containers and add a small sticker with your brand name and phone number. Clean packaging builds repeat customers!",
        "સાફ પાઉચ કે બરણી વાપરો અને તમારા બ્રાન્ડ તથા ફોન નંબરનું સ્ટીકર લગાવો. આનાથી ગ્રાહકોનો ભરોસો વધે છે!",
        "Suthamana packaging matrum ungal peyar, phone number koodiya sticker otungall. Idhu vaadikkaiyaalargalai adhigarikkum!"
      ),
      action: { name: "start-create", value: "-" },
    };
  }

  // Default empathetic fallback
  return {
    reply: say(
      "मैं सखी दीदी हूँ! आप मुझसे सामान की सही कीमत, सुंदर फोटो, WhatsApp पर बिक्री या सरकारी योजनाओं के बारे में कुछ भी पूछ सकती हैं. आज मैं आपकी क्या सहायता करूँ?",
      "मी सखी दीदी! उत्पादन किंमत, सुंदर फोटो, WhatsApp वर ऑर्डर मिळवणे किंवा सरकारी योजनांबद्दल मला विचारा. आज तुमच्या व्यवसायासाठी मी काय मदत करू?",
      "I'm Sakhi Didi! Ask me about setting prices, product photography, WhatsApp orders, or government schemes. How can I support your business right now?",
      "હું સખી દીદી છું! તમે મને ભાવ, ફોટા, WhatsApp ઓર્ડર કે સરકારી યોજનાઓ વિશે પૂછી શકો છો. આજે હું તમારી શું મદદ કરું?",
      "Naan Sakhi Didi! Vilai nirnayam, photo, WhatsApp virpanai alladhu arasu thittangal patri ennidamidam kelungal. Indru naan enna udhavi seiyattum?"
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
