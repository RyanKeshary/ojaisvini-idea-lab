import type { LessonContent } from "./catalog";

/** Full Tamil catalog: 8 journeys × 3 lessons. */
export const TA: Record<string, LessonContent> = {
  "phone-1": {
    title: "Phone adippadai",
    cards: [
      { icon: "🔋", text: "Raaththiri charge sei. Battery theerndhaal kadai moodum." },
      { icon: "📶", text: "Mukkonam kodingal network kaattum. 1 kodu WhatsApp-kku podhum." },
      { icon: "🔊", text: "Pakkavattil satham button. Order alert-kku sound on vai." },
      { icon: "🏠", text: "Vatta alladhu chadhura button eppodhum veetirkku kondu pogum. Edhuvum kedadhu." },
    ],
    task: { kind: "none", instruction: "Home button-ai kandupidi, irandu murai azhuthu." },
    quiz: {
      q: "Veetirkku endha button kondu pogum?",
      options: [{ icon: "🏠", label: "Home" }, { icon: "🔋", label: "Battery" }, { icon: "📷", label: "Camera" }],
      answer: 0,
    },
  },
  "phone-2": {
    title: "WhatsApp matrum photo",
    cards: [
      { icon: "💬", text: "WhatsApp pachchai icon. Buyer-udan pesuvadhu inge dhaan." },
      { icon: "📷", text: "Camera icon-aal photo. Product photo ingirundhu aarambam." },
      { icon: "🖼️", text: "Gallery-il ella photo-galum. Samaan photo inge kidaikkum." },
      { icon: "⌨️", text: "Keyboard mic button pesuvadhai ezhudhividum." },
    ],
    task: { kind: "none", instruction: "Gallery thira, pudhiya photo thedu." },
    quiz: {
      q: "Photo engge irukku?",
      options: [{ icon: "💬", label: "WhatsApp" }, { icon: "🖼️", label: "Gallery" }, { icon: "⏰", label: "Kadigaaram" }],
      answer: 1,
    },
  },
  "phone-3": {
    title: "Internet matrum recharge",
    cards: [
      { icon: "📶", text: "Recharge moolam data kidaikkum. Balance kadaikaararidam kelu." },
      { icon: "📴", text: "Ojasvini velaiyai save seiyum. Network vandhadhum anuppividum." },
      { icon: "🔒", text: "Phone-il PIN vai, yaarum kadaiyai thirakka mudiyaadhu." },
      { icon: "🆘", text: "Maattikondaal ovvoru thiraiyilum Kelu + Sakhi button irukku." },
    ],
    task: { kind: "none", instruction: "Mela menu-ilirundhu data-vai oru murai off-on sei." },
    quiz: {
      q: "Network illaiyel velai ennavagum?",
      options: [{ icon: "🗑️", label: "Pochu" }, { icon: "💾", label: "Save, pinbu pogum" }, { icon: "🔒", label: "Lock" }],
      answer: 1,
    },
  },
  "upi-1": {
    title: "UPI enbadhu enna?",
    cards: [
      { icon: "💸", text: "UPI vinadigalil buyer-idamirundhu unnidam panam kondu serum." },
      { icon: "🏦", text: "Un bank kanakudan inaigiradhu. Pudhiya kanakku vendam." },
      { icon: "🆔", text: "Un UPI ID name@bank pola. Panam vaanga idhaiye pagirndhu." },
      { icon: "🆓", text: "UPI-il panam vaanga kattanam illai." },
    ],
    task: { kind: "upi", instruction: "Keezhe practice sei: ₹150 podu, send azhuthu. Poli panam." },
    quiz: {
      q: "Panam vaanga enna pagirvai?",
      options: [{ icon: "🔑", label: "ATM PIN" }, { icon: "🆔", label: "UPI ID" }, { icon: "📷", label: "Photo" }],
      answer: 1,
    },
  },
  "upi-2": {
    title: "Mudhal UPI payment",
    cards: [
      { icon: "1️⃣", text: "Buyer kadai link-il Pay azhuthugiraar." },
      { icon: "2️⃣", text: "Tham UPI app-il PIN-aal approve seigiraar." },
      { icon: "3️⃣", text: "Unakku alert + order theriyum. Panam bankai serum." },
      { icon: "🧾", text: "Ovvoru payment-kkum receipt varum. Orders-il paar." },
    ],
    task: { kind: "upi", instruction: "₹300-aal meendum practice sei. Success thirai paar." },
    quiz: {
      q: "UPI PIN-ai yaar poduvaar?",
      options: [{ icon: "🧕", label: "Buyer" }, { icon: "👩", label: "Nee" }, { icon: "👨", label: "Manager" }],
      answer: 0,
    },
  },
  "upi-3": {
    title: "UPI safety vidhigal",
    cards: [
      { icon: "🚫", text: "Un UPI PIN-aiyo OTP-aiyo yaarukkum EPPODHUM kodukkaadhe. Bank-kaaran ketkamaattaar." },
      { icon: "👁️", text: "Panam VAANGA PIN vendam. Kettaal adhu fraud." },
      { icon: "🔍", text: "Payer peyarai paaru. Theriyaadha peyar: poru." },
      { icon: "📞", text: "Emmatram pola therindhaal udane 1930 (cyber helpline) call sei." },
    ],
    task: { kind: "none", instruction: "Safety vidhiyai sathamaaga sollu: en PIN enakkum mattum." },
    quiz: {
      q: "Yaaravadhu panam anuppa PIN kettaal. Nee…",
      options: [{ icon: "✅", label: "Kodu" }, { icon: "🚫", label: "Maru, adhu fraud" }, { icon: "⏳", label: "Pinbu kodu" }],
      answer: 1,
    },
  },
  "whatsapp-1": {
    title: "WhatsApp Business basics",
    cards: [
      { icon: "🏪", text: "WhatsApp Business phone-il ilavasa kadai." },
      { icon: "📝", text: "Kadai peyar, photo, neram oru murai set sei." },
      { icon: "⚡", text: "Quick reply-aal podhu kelvigalukku oru-thadavai badhil." },
      { icon: "🏷️", text: "Label ottu: pudhiyavar, paid, anuppa vendiyadhu." },
    ],
    task: { kind: "whatsapp", instruction: "Keezhe oru catalog item uruvaakku: peyar + vilai." },
    quiz: {
      q: "Buyer-kku porutkalai edhu kaattum?",
      options: [{ icon: "📢", label: "Status" }, { icon: "🗂️", label: "Catalog" }, { icon: "🎮", label: "Game" }],
      answer: 1,
    },
  },
  "whatsapp-2": {
    title: "Buyer-udan pesa",
    cards: [
      { icon: "👋", text: "Viraivil vanakkam sollu. Vegamaana badhil adhigam virkkum." },
      { icon: "📸", text: "Kettaal pudhiya photo anuppu. Kadai photo-ve." },
      { icon: "💰", text: "Vilaiyai edaiyudan thelivaaga sollu: 250g oorugaai ₹150." },
      { icon: "🙏", text: "Delivery-kku pin nandri sollu, review kelu." },
    ],
    task: { kind: "whatsapp", instruction: "Veru vilaiyil irandaavadhu item ser." },
    quiz: {
      q: "Vilai kettaal sirandha badhil?",
      options: [{ icon: "🤫", label: "Badhil illai" }, { icon: "💰", label: "250g ₹150, indha vaaram fresh" }, { icon: "❓", label: "Nee sollu" }],
      answer: 1,
    },
  },
  "whatsapp-3": {
    title: "Virkkum broadcast",
    cards: [
      { icon: "📣", text: "Oru message palavarukku: pudhiya stock, festival offer." },
      { icon: "📅", text: "Vaaram oru murai, kaalai. Dhinasari message erichchal." },
      { icon: "🖼️", text: "Eppodhum photo ser. Photo-udan message 3x virkkum." },
      { icon: "🚫", text: "Mattavargal offer-ai forward seiyaadhe. Un kadai mattum." },
    ],
    task: { kind: "none", instruction: "Un sirandha product-kku oru broadcast vari ezhudhu." },
    quiz: {
      q: "Broadcast evvalavu murai?",
      options: [{ icon: "📅", label: "Vaaram onru" }, { icon: "⏰", label: "Mani neram" }, { icon: "🌙", label: "Dhinasari nadhiraathiri" }],
      answer: 0,
    },
  },
  "photo-1": {
    title: "Velichcham dhaan ellaam",
    cards: [
      { icon: "🪟", text: "Porulai jannal-kadhavu arugil vai. Pagal velichcham ilavasa studio." },
      { icon: "🚫", text: "Flash eppodhum upayogikkaadhe. Nirangal erindhuvidum." },
      { icon: "⬅️", text: "Velichcham pakkavattilirundhu vara vendum, pinnadi irundhu alla." },
      { icon: "🌤️", text: "Kaalai 8–10 photo-kku sirandha neram." },
    ],
    task: { kind: "photo", instruction: "Light tips paar, araiyil enna irukku tick sei." },
    quiz: {
      q: "Sirandha velichcham edhu?",
      options: [{ icon: "📸", label: "Flash" }, { icon: "🪟", label: "Jannal pagal" }, { icon: "🕯️", label: "Mezhuguvarthi" }],
      answer: 1,
    },
  },
  "photo-2": {
    title: "Sariyaana frame",
    cards: [
      { icon: "🎯", text: "Porul naduvil, sutri idam." },
      { icon: "📐", text: "Phone-ai neraaga pidi, saaikkaadhe." },
      { icon: "🧹", text: "Pinnadi ulla karandi-bottle-galai edu." },
      { icon: "🔍", text: "Thiraiyil porulai thodu (focus), pin click." },
    ],
    task: { kind: "photo", instruction: "Frame practice: ovvoru vidhiyaiyum muyarchithu tick sei." },
    quiz: {
      q: "Porulukku pinnadi enna irukka vendum?",
      options: [{ icon: "🧹", label: "Suthamana kaali" }, { icon: "🍽️", label: "Niraindha kitchen" }, { icon: "📺", label: "Odum TV" }],
      answer: 0,
    },
  },
  "photo-3": {
    title: "Virkkum 3 photo",
    cards: [
      { icon: "1️⃣", text: "Photo 1: muzhhu porul, munnadi paarvai." },
      { icon: "2️⃣", text: "Photo 2: close-up (oorugaai ennai, velai). " },
      { icon: "3️⃣", text: "Photo 3: packing alladhu edai (tharaasil jaar)." },
      { icon: "✅", text: "Ojasvini-il 4 varai photo. Adhiga konam, adhiga nambikkai." },
    ],
    task: { kind: "none", instruction: "Aduththa product-kku 3 photo plan sei." },
    quiz: {
      q: "Endha set nalla virkkum?",
      options: [{ icon: "1️⃣", label: "Oru irutta photo" }, { icon: "3️⃣", label: "Front + close-up + packing" }, { icon: "🤳", label: "Selfie" }],
      answer: 1,
    },
  },
  "pricing-1": {
    title: "Selavai therindhu kol",
    cards: [
      { icon: "🧾", text: "Selavu = porul + packing + un neram. Moondraiyum ezhudhu." },
      { icon: "⚖️", text: "Example: 1kg maangai ₹80 + jaar ₹20 + ennai-masala ₹40 = ₹140." },
      { icon: "➗", text: "Seidha jaar-galal vaagu. 4 jaar → ₹35 per jaar." },
      { icon: "📓", text: "Oru notebook vai. Ovvoru product-kkum oru pakkam." },
    ],
    task: { kind: "none", instruction: "Kadasiya product-in moondru selavaiyum notebook-il ezhudhu." },
    quiz: {
      q: "Selavil enna?",
      options: [{ icon: "🧾", label: "Porul + packing + neram" }, { icon: "🎲", label: "Yoogam" }, { icon: "0️⃣", label: "Edhuvum illai" }],
      answer: 0,
    },
  },
  "pricing-2": {
    title: "Vilai nirnayam",
    cards: [
      { icon: "➕", text: "Vilai = selavu + laabam. 30–50% laabam aarogyam." },
      { icon: "🏘️", text: "Arugil kadaigalai paar. Adhe band-il iru, migavum malivaaga vendam." },
      { icon: "⚖️", text: "Example: ₹35 selavu → ₹50–₹60 vil." },
      { icon: "📉", text: "Miga malivu bayamuruthum. Nyaayamaana vilai nambikkai tharum." },
    ],
    task: { kind: "none", instruction: "30–50% vidhiyaal sirandha product vilai vai." },
    quiz: {
      q: "Selavu ₹40. Sariyaana vilai?",
      options: [{ icon: "📉", label: "₹35" }, { icon: "✅", label: "₹55" }, { icon: "🚀", label: "₹200" }],
      answer: 1,
    },
  },
  "pricing-3": {
    title: "Velai seiyum discount",
    cards: [
      { icon: "🎁", text: "Combo: ₹300-ya 2 jaar ₹280-kku. Combo adhigam virkkum." },
      { icon: "🪔", text: "Festival offer 7 naal mattum. Avasaram virkkum." },
      { icon: "🚫", text: "Selavukku keezhe eppodhum vendam. ₹500-kku mel free delivery." },
      { icon: "📣", text: "Offer-ai oru murai WhatsApp broadcast-il sollu." },
    ],
    task: { kind: "none", instruction: "Kadaikku oru combo offer uruvaakku." },
    quiz: {
      q: "Safe discount vidhi?",
      options: [{ icon: "🚫", label: "Selavukku keezhe eppodhum illai" }, { icon: "🎁", label: "Eppodhum 50% off" }, { icon: "🤫", label: "Vilaiyai marai" }],
      answer: 0,
    },
  },
  "packing-1": {
    title: "Pro pola packing",
    cards: [
      { icon: "🫙", text: "Unavu: kaatraadha jaar, vilimbai thudaithu, tight seal." },
      { icon: "🧵", text: "Thunigal: madithu, poly bag, pin paper bag." },
      { icon: "🏷️", text: "Ovvoru pack-ilum label: peyar, edai, thedhi." },
      { icon: "💧", text: "Oorugaai jaar neraga. Mela pakkam kuriyidu." },
    ],
    task: { kind: "none", instruction: "Oru product muzhudhum pack seidhu label paar." },
    quiz: {
      q: "Ovvoru pack-ilum enna?",
      options: [{ icon: "🏷️", label: "Peyar + edai + thedhi" }, { icon: "📰", label: "Seidhithaazh mattum" }, { icon: "❌", label: "Edhuvum illai" }],
      answer: 0,
    },
  },
  "packing-2": {
    title: "Delivery vazhigal",
    cards: [
      { icon: "🚶", text: "Arugil buyer: than pickup ilavasam matrum vegam." },
      { icon: "🛵", text: "Gramaathil: veettu aalo alladhu Sakhi kondu varuvaar." },
      { icon: "📮", text: "Thoora order: post/courier. ₹30 delivery ser." },
      { icon: "📦", text: "Village pooling: Sakhi ella order-aiyum serthu, selavai pagirndhu." },
    ],
    task: { kind: "none", instruction: "Default therndhedu: pickup, than-delivery, alladhu courier." },
    quiz: {
      q: "Thoora order malivaaga eppadi?",
      options: [{ icon: "✈️", label: "Flight" }, { icon: "📦", label: "Pooled pickup" }, { icon: "🚶", label: "200km nadai" }],
      answer: 1,
    },
  },
  "packing-3": {
    title: "Pugaarai amaindhiyaaga",
    cards: [
      { icon: "📞", text: "Pugaar mudhalil: muzhudhum kelu, oru murai sorry, photo kelu." },
      { icon: "🔄", text: "Udaindhadhu/kettadhu: maatri alladhu refund. Oru nattam pathu buyer-ai kaakkum." },
      { icon: "📓", text: "Ovvoru pugaaraiyum ezhudhu. Meendum vandhaal recipe/packing maaru." },
      { icon: "⭐", text: "Nalla theerthaal, kobamana buyer un sathamaana fan." },
    ],
    task: { kind: "none", instruction: "Un replacement vaakkudhiyai oru variyil ezhudhu." },
    quiz: {
      q: "Jaar udaindhu vandhadhu. Nee…",
      options: [{ icon: "🙈", label: "Kandukkaadhe" }, { icon: "🔄", label: "Maatru alladhu refund" }, { icon: "😡", label: "Sandai podu" }],
      answer: 1,
    },
  },
  "safety-1": {
    title: "Mosadi kandupidi",
    cards: [
      { icon: "🎣", text: "Aasai kaattum ordergal (100 jaar, advance kodu) perumbaalum valai." },
      { icon: "🔗", text: "Theriyaadha link-ai eppodhum thodadhe. Buyer un kadai link-ai upayogippaar." },
      { icon: "💳", text: "OTP, PIN, CVV yaarukkum kodukkaadhe. Eppodhum kodukkaadhe." },
      { icon: "🕵️", text: "Paar: buyer saadhhaarana kelvigalukku badhil solgiraara? Mosadi avasaram kaattum." },
    ],
    task: { kind: "none", instruction: "Indru veetil oruvarukku OTP vidhiyai sollu." },
    quiz: {
      q: "Buyer panam anuppa OTP kettaal. Adhu…",
      options: [{ icon: "✅", label: "Saadhaaranam" }, { icon: "🚨", label: "Fraud" }, { icon: "🤷", label: "Kuzhappam" }],
      answer: 1,
    },
  },
  "safety-2": {
    title: "Safe phone pazhakkangal",
    cards: [
      { icon: "🔒", text: "Phone lock + Ojasvini PIN: kadaikku irandu poottu." },
      { icon: "👋", text: "Pagirndha phone-il logout sei. Profile-il oru thodu." },
      { icon: "📸", text: "Muga photo engum vendam. Product photo mattum." },
      { icon: "🌙", text: "Auto-lock: app thaanaaga moodividum." },
    ],
    task: { kind: "none", instruction: "Indru phone lock on sei, off-na irundhaal." },
    quiz: {
      q: "Pagirndha family phone. Nee…",
      options: [{ icon: "🔓", label: "Login-ai vidu" }, { icon: "👋", label: "Velai pin logout" }, { icon: "📝", label: "Cover-il PIN ezhudhu" }],
      answer: 1,
    },
  },
  "safety-3": {
    title: "Thappu nadandhaal",
    cards: [
      { icon: "📞", text: "Pana mosadi: mani nerathil 1930-kku call sei. Vegam mukkiyam." },
      { icon: "🧾", text: "Chat matrum payment screenshot-galai aadhhaaramaaga vai." },
      { icon: "👩", text: "Sakhi-kku sollu. Avar mun paarthadhu, vazhi kaattuvaar." },
      { icon: "💪", text: "Report seivadhu aduththa pennaiyum kaakkum." },
    ],
    task: { kind: "none", instruction: "1930-ai ippodhe phone-il save sei." },
    quiz: {
      q: "Mosadi pola therindhaal mudhal adi?",
      options: [{ icon: "📞", label: "Viraivil 1930 call" }, { icon: "😴", label: "Maadham poru" }, { icon: "🗑️", label: "Ellaam delete" }],
      answer: 0,
    },
  },
  "schemes-1": {
    title: "Unakkerra thittangal",
    cards: [
      { icon: "🏛️", text: "Arasu thittangal pengalukku loan, training, subsidy tharum." },
      { icon: "🎯", text: "Perumbaalum: pen + chinna business + Aadhaar vendum." },
      { icon: "📋", text: "Thaiyaarai vai: Aadhaar, bank passbook, oru photo, business proof." },
      { icon: "🔍", text: "Ojasvini Scheme Finder unakku kidaikkakkudiyavai mattum kaattum." },
    ],
    task: { kind: "none", instruction: "Aadhaar + passbook-ai oru folder-il vai." },
    quiz: {
      q: "Perumbaalaana thittangal mudhalil enna ketkum?",
      options: [{ icon: "🎓", label: "English degree" }, { icon: "📋", label: "Aadhaar + business proof" }, { icon: "🏙️", label: "Nagara mugavari" }],
      answer: 1,
    },
  },
  "schemes-2": {
    title: "MUDRA loan eliyaaga",
    cards: [
      { icon: "💰", text: "MUDRA chinna business-kku ₹10 lakh varai loan, guarantee illai." },
      { icon: "🏦", text: "Endha bank-ilum Aadhaar + business details-aal apply sei." },
      { icon: "📝", text: "5 vari ezhudhu: enna virkkiraai, maadha selavu, varuvaai." },
      { icon: "⏳", text: "Bank vaarangal edukkum. Sakhi follow-up-il udan varuvaar." },
    ],
    task: { kind: "none", instruction: "Notebook-il un 5-vari business note ezhudhu." },
    quiz: {
      q: "MUDRA loan-kku enna vendum?",
      options: [{ icon: "🏠", label: "Veedu guarantee" }, { icon: "📝", label: "Aadhaar + business details" }, { icon: "💎", label: "Thangam" }],
      answer: 1,
    },
  },
  "schemes-3": {
    title: "Bayamillamal apply sei",
    cards: [
      { icon: "🖥️", text: "Pala form online. Sakhi alladhu cyber-cafe udhavum." },
      { icon: "❌", text: "Ilavasa thittathukku yaarum panam ketka mudiyaadhu. Report sei." },
      { icon: "📬", text: "Reject letter kaaranam sollum. Sari seidhu meendum apply sei." },
      { icon: "🤝", text: "SHG-kku pala thittangalil munnurimai. Ondril serndhu kol." },
    ],
    task: { kind: "none", instruction: "Sakhi-kku kelu endha thittam unakku best." },
    quiz: {
      q: "Officer ilavasa thittathukku panam kettaal. Nee…",
      options: [{ icon: "💸", label: "Amaindhiyaaga kodu" }, { icon: "🚫", label: "Maru, report sei" }, { icon: "🏃", label: "Vidru" }],
      answer: 1,
    },
  },
};
