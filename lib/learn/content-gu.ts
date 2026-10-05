import type { LessonContent } from "./catalog";

/** Full Gujarati catalog: 8 journeys × 3 lessons. */
export const GU: Record<string, LessonContent> = {
  "phone-1": {
    title: "Phone ni basic baabo",
    cards: [
      { icon: "🔋", text: "Rate charge karo. Battery khute to dukaan bandh." },
      { icon: "📶", text: "Trikon lines network bataave. 1 line WhatsApp mate kaafi." },
      { icon: "🔊", text: "Side na button thi avaaj. Order alert mate sound chalu raakho." },
      { icon: "🏠", text: "Gol button hammesh ghar lai jaay. Kai bagdtu nathi." },
    ],
    task: { kind: "none", instruction: "Home button shodho, be vaar dabaavo." },
    quiz: {
      q: "Ghare kayo button lai jaay?",
      options: [{ icon: "🏠", label: "Home" }, { icon: "🔋", label: "Battery" }, { icon: "📷", label: "Camera" }],
      answer: 0,
    },
  },
  "phone-2": {
    title: "WhatsApp ane photo",
    cards: [
      { icon: "💬", text: "WhatsApp leelo icon chhe. Buyer saathe vaat ahin thaay." },
      { icon: "📷", text: "Camera icon thi photo. Product photo ahin thi sharu." },
      { icon: "🖼️", text: "Gallery maa badhi photo. Samaan ni photo ahin malshe." },
      { icon: "⌨️", text: "Keyboard no mic button bolelu lakhee aape." },
    ],
    task: { kind: "none", instruction: "Gallery kholo, navin photo shodho." },
    quiz: {
      q: "Photo kyaan rahe chhe?",
      options: [{ icon: "💬", label: "WhatsApp" }, { icon: "🖼️", label: "Gallery" }, { icon: "⏰", label: "Ghadiyaad" }],
      answer: 1,
    },
  },
  "phone-3": {
    title: "Internet ane recharge",
    cards: [
      { icon: "📶", text: "Recharge thi data male. Balance dukaandaar paase puchho." },
      { icon: "📴", text: "Ojasvini kaam save raakhe. Network aavtaa mokli deshe." },
      { icon: "🔒", text: "Phone maa PIN laavo, jethee koi dukaan na khole." },
      { icon: "🆘", text: "Atko to darek screen par Saambhalo ane Sakhi button chhe." },
    ],
    task: { kind: "none", instruction: "Uppar naa menu thi data ek vaar off-on karo." },
    quiz: {
      q: "Network na hoy to kaam nu shu?",
      options: [{ icon: "🗑️", label: "Gayu" }, { icon: "💾", label: "Save, pachhi jashe" }, { icon: "🔒", label: "Lock" }],
      answer: 1,
    },
  },
  "upi-1": {
    title: "UPI shu chhe?",
    cards: [
      { icon: "💸", text: "UPI secondomaa buyer paase thi tamne paisa pahonchaade." },
      { icon: "🏦", text: "Tamaara bank khaata saathe jodaay. Navu khaatu joitu nathi." },
      { icon: "🆔", text: "Tamaari UPI ID name@bank jevi. Paisa leva mate ej vaanto." },
      { icon: "🆓", text: "UPI par paisa levaano koi charge nathi." },
    ],
    task: { kind: "upi", instruction: "Neeche practice karo: ₹150 lakho, send dabaavo. Nakli paisa." },
    quiz: {
      q: "Paisa leva shu vaantsho?",
      options: [{ icon: "🔑", label: "ATM PIN" }, { icon: "🆔", label: "UPI ID" }, { icon: "📷", label: "Photo" }],
      answer: 1,
    },
  },
  "upi-2": {
    title: "Pehlu UPI payment",
    cards: [
      { icon: "1️⃣", text: "Buyer dukaan link par Pay dabaave." },
      { icon: "2️⃣", text: "Potana UPI app maa potana PIN thi approve kare." },
      { icon: "3️⃣", text: "Tamane alert + order dekhaay. Paisa bank pahonche." },
      { icon: "🧾", text: "Darek payment ni receipt bane. Orders maa juo." },
    ],
    task: { kind: "upi", instruction: "₹300 thi fari practice karo. Success screen juo." },
    quiz: {
      q: "UPI PIN kon naakhe?",
      options: [{ icon: "🧕", label: "Buyer" }, { icon: "👩", label: "Tame" }, { icon: "👨", label: "Manager" }],
      answer: 0,
    },
  },
  "upi-3": {
    title: "UPI safety niyam",
    cards: [
      { icon: "🚫", text: "Tamaaro UPI PIN ke OTP kone KAAREY na aapo. Bank vaada kyaarey na maange." },
      { icon: "👁️", text: "Paisa LEVA mate PIN na laage. Maange to fraud chhe." },
      { icon: "🔍", text: "Payer nu naam tapaso. Ajaanya naam: thobho." },
      { icon: "📞", text: "Thag laagto to tarat 1930 (cyber helpline) par call karo." },
    ],
    task: { kind: "none", instruction: "Safety niyam motethee bolo: maaro PIN fakt maaro." },
    quiz: {
      q: "Koi paisa mokalvaa PIN maange. Tame…",
      options: [{ icon: "✅", label: "Aapi do" }, { icon: "🚫", label: "Naa paado, fraud chhe" }, { icon: "⏳", label: "Pachhi aapo" }],
      answer: 1,
    },
  },
  "whatsapp-1": {
    title: "WhatsApp Business basics",
    cards: [
      { icon: "🏪", text: "WhatsApp Business phone par free dukaan chhe." },
      { icon: "📝", text: "Dukaannu naam, photo, timing ek vaar set karo." },
      { icon: "⚡", text: "Quick reply thi saamanya prashnono ek-tap javaab." },
      { icon: "🏷️", text: "Label laagaavo: navo, paid, aapvaanu chhe." },
    ],
    task: { kind: "whatsapp", instruction: "Neeche ek catalog item banaavo: naam + bhaav." },
    quiz: {
      q: "Buyer ne product shu bataave?",
      options: [{ icon: "📢", label: "Status" }, { icon: "🗂️", label: "Catalog" }, { icon: "🎮", label: "Game" }],
      answer: 1,
    },
  },
  "whatsapp-2": {
    title: "Buyer saathe vaat",
    cards: [
      { icon: "👋", text: "Jaldi namaste karo. Zadaki javaab vadhaare veche." },
      { icon: "📸", text: "Maange tyaare taajo photo moklo. Dukaan vaado j photo." },
      { icon: "💰", text: "Bhaav vajan saathe saaf bolo: 250g achaar ₹150." },
      { icon: "🙏", text: "Delivery pachhi thanks bolo, review maango." },
    ],
    task: { kind: "whatsapp", instruction: "Judaa bhaavni beeji item jodo." },
    quiz: {
      q: "Bhaav puchhe to best javaab?",
      options: [{ icon: "🤫", label: "Javaab nahin" }, { icon: "💰", label: "250g ₹150, aa athvaadiye taaju" }, { icon: "❓", label: "Tame kaho" }],
      answer: 1,
    },
  },
  "whatsapp-3": {
    title: "Vechaata broadcast",
    cards: [
      { icon: "📣", text: "Ek message badhaane: navo maal, tahevaar offer." },
      { icon: "📅", text: "Athvaadiye ek vaar, savaare. Roz message herran kare." },
      { icon: "🖼️", text: "Photo hammeshaa jodo. Photo vaada message 3x veche." },
      { icon: "🚫", text: "Beejaana offer forward na karo. Fakt potaani dukaan." },
    ],
    task: { kind: "none", instruction: "Best product mate ek broadcast line lakho." },
    quiz: {
      q: "Broadcast ketli vaar?",
      options: [{ icon: "📅", label: "Athvaadiye ek" }, { icon: "⏰", label: "Darek kalaake" }, { icon: "🌙", label: "Roz madhyaraat" }],
      answer: 0,
    },
  },
  "photo-1": {
    title: "Prakash ej badhu chhe",
    cards: [
      { icon: "🪟", text: "Samaan baari-darvaaja paase raakho. Tadko free studio chhe." },
      { icon: "🚫", text: "Flash kyaarey na vaaparo. Rang badi jaay." },
      { icon: "⬅️", text: "Prakash bajuthi aavvo joiye, paachhalthi nahin." },
      { icon: "🌤️", text: "Savaar 8–10 photo no best time chhe." },
    ],
    task: { kind: "photo", instruction: "Light tips juo, ordaamaa shu chhe tick karo." },
    quiz: {
      q: "Best prakash kayo?",
      options: [{ icon: "📸", label: "Flash" }, { icon: "🪟", label: "Baarino tadko" }, { icon: "🕯️", label: "Mombatti" }],
      answer: 1,
    },
  },
  "photo-2": {
    title: "Saachi frame",
    cards: [
      { icon: "🎯", text: "Samaan vachche, chaare baaju jagya." },
      { icon: "📐", text: "Phone seedho pakdo, vaanko nahin." },
      { icon: "🧹", text: "Paachhalnaa chamcha-baatli kaadho." },
      { icon: "🔍", text: "Screen par samaanne touch karo (focus), pachhi click." },
    ],
    task: { kind: "photo", instruction: "Frame practice: darek niyam try kareene tick karo." },
    quiz: {
      q: "Samaan paachhal shu hovu joiye?",
      options: [{ icon: "🧹", label: "Saaf khaali" }, { icon: "🍽️", label: "Bharelu kitchen" }, { icon: "📺", label: "Chaalu TV" }],
      answer: 0,
    },
  },
  "photo-3": {
    title: "Vechaati 3 photo",
    cards: [
      { icon: "1️⃣", text: "Photo 1: aakho samaan, saamethi." },
      { icon: "2️⃣", text: "Photo 2: close-up (achaarnu tel, bharatkaam)." },
      { icon: "3️⃣", text: "Photo 3: packing ke vajan (taaraju par dibbo)." },
      { icon: "✅", text: "Ojasvini maa 4 sudhee photo. Vadhaare angle, vadhaare bharoso." },
    ],
    task: { kind: "none", instruction: "Aagaami product naa 3 photo plan karo." },
    quiz: {
      q: "Kayo set best vechashe?",
      options: [{ icon: "1️⃣", label: "Ek andhaari photo" }, { icon: "3️⃣", label: "Front + close-up + packing" }, { icon: "🤳", label: "Selfie" }],
      answer: 1,
    },
  },
  "pricing-1": {
    title: "Kharch jaano",
    cards: [
      { icon: "🧾", text: "Kharch = samaan + packing + tamaaro time. Traney lakho." },
      { icon: "⚖️", text: "Example: 1kg keree ₹80 + dibbo ₹20 + tel-masalo ₹40 = ₹140." },
      { icon: "➗", text: "Jetla dibba banya, bhaag karo. 4 dibba → ₹35 per dibbo." },
      { icon: "📓", text: "Ek chopdi raakho. Dareek product ek paanu." },
    ],
    task: { kind: "none", instruction: "Pachhala product naa traney kharch chopdimaa lakho." },
    quiz: {
      q: "Kharchamaa shu?",
      options: [{ icon: "🧾", label: "Samaan + packing + time" }, { icon: "🎲", label: "Andaajo" }, { icon: "0️⃣", label: "Kai nahin" }],
      answer: 0,
    },
  },
  "pricing-2": {
    title: "Bhaav laagvo",
    cards: [
      { icon: "➕", text: "Bhaav = kharch + nafo. 30–50% nafo healthy chhe." },
      { icon: "🏘️", text: "Aajubaajuni dukaan juo. Same band maa raho, sauthi sastaa nahin." },
      { icon: "⚖️", text: "Example: ₹35 kharch → ₹50–₹60 vecho." },
      { icon: "📉", text: "Bahu sastu daraave. Saacho bhaav bharoso banaave." },
    ],
    task: { kind: "none", instruction: "30–50% niyamthi best product no bhaav laagvo." },
    quiz: {
      q: "Kharch ₹40. Saacho bhaav?",
      options: [{ icon: "📉", label: "₹35" }, { icon: "✅", label: "₹55" }, { icon: "🚀", label: "₹200" }],
      answer: 1,
    },
  },
  "pricing-3": {
    title: "Chaaltaa discount",
    cards: [
      { icon: "🎁", text: "Combo: ₹300 naa 2 dibba ₹280 maa. Combo vadhaare vechaay." },
      { icon: "🪔", text: "Tahevaar offer fakt 7 divas. Utaval veche." },
      { icon: "🚫", text: "Kharchthi neeche kyaarey nahin. ₹500 upar free delivery." },
      { icon: "📣", text: "Offer ek vaar WhatsApp broadcast par kaho." },
    ],
    task: { kind: "none", instruction: "Dukaan mate ek combo offer banaavo." },
    quiz: {
      q: "Safe discount niyam?",
      options: [{ icon: "🚫", label: "Kharchthi neeche kyaarey nahin" }, { icon: "🎁", label: "Hammeshaa 50% off" }, { icon: "🤫", label: "Bhaav chhupaavo" }],
      answer: 0,
    },
  },
  "packing-1": {
    title: "Pro jevi packing",
    cards: [
      { icon: "🫙", text: "Khaanu: airtight dibbo, kinari luncho, tight seal." },
      { icon: "🧵", text: "Kapdaa: ghadi vaado, poly bag, pachhi paper bag." },
      { icon: "🏷️", text: "Darek pack par label: naam, vajan, taarikh." },
      { icon: "💧", text: "Achaarnaa dibba seedha. Uparni nishaani karo." },
    ],
    task: { kind: "none", instruction: "Ek product puru pack kareene label tapaso." },
    quiz: {
      q: "Darek pack par shu?",
      options: [{ icon: "🏷️", label: "Naam + vajan + taarikh" }, { icon: "📰", label: "Fakt chhaapu" }, { icon: "❌", label: "Kai nahin" }],
      answer: 0,
    },
  },
  "packing-2": {
    title: "Delivery options",
    cards: [
      { icon: "🚶", text: "Najikna buyer: jaate pickup free ane fast." },
      { icon: "🛵", text: "Gaammaa: gharno koi ke Sakhi aapi aavshe." },
      { icon: "📮", text: "Door naa order: post/courier. ₹30 delivery jodo." },
      { icon: "📦", text: "Village pooling: Sakhi badhaana order eksaathe, kharch vahechne." },
    ],
    task: { kind: "none", instruction: "Default pasand karo: pickup, self-delivery, ke courier." },
    quiz: {
      q: "Door naa order sastaa kevi rite?",
      options: [{ icon: "✈️", label: "Flight" }, { icon: "📦", label: "Pooled pickup" }, { icon: "🚶", label: "200km chaalo" }],
      answer: 1,
    },
  },
  "packing-3": {
    title: "Fariyaad shaantithi",
    cards: [
      { icon: "📞", text: "Fariyaad pehla: puru saambhalo, ek vaar sorry, photo maango." },
      { icon: "🔄", text: "Tootelu/bagadelu: badlo ke refund. Ek nuksaan dus buyer bachaave." },
      { icon: "📓", text: "Darek fariyaad lakho. Repeat thaay to recipe/packing badlo." },
      { icon: "⭐", text: "Saaree rite ukelo, naraaj buyer sauthi moto fan." },
    ],
    task: { kind: "none", instruction: "Tamaaru replacement vachan ek line maa lakho." },
    quiz: {
      q: "Dibbo tootelo aavyo. Tame…",
      options: [{ icon: "🙈", label: "Ignore" }, { icon: "🔄", label: "Badlo ke refund" }, { icon: "😡", label: "Jhagdo" }],
      answer: 1,
    },
  },
  "safety-1": {
    title: "Fraud odakho",
    cards: [
      { icon: "🎣", text: "Laalach vaada order (100 dibba, advance aapo) ghanivaar jaal hoy chhe." },
      { icon: "🔗", text: "Ajaani link kyaarey na dabaavo. Buyer tamaari shop link vaaparshe." },
      { icon: "💳", text: "OTP, PIN, CVV kone nahin. Kyaarey nahin." },
      { icon: "🕵️", text: "Juo: shu buyer seedhaa prashnona javaab aape? Fraud utaavad kare." },
    ],
    task: { kind: "none", instruction: "Aaje ghare ekne OTP niyam kaho." },
    quiz: {
      q: "Buyer paisa mokalvaa OTP maange. E…",
      options: [{ icon: "✅", label: "Normal" }, { icon: "🚨", label: "Fraud" }, { icon: "🤷", label: "Confusing" }],
      answer: 1,
    },
  },
  "safety-2": {
    title: "Safe phone aadato",
    cards: [
      { icon: "🔒", text: "Phone lock + Ojasvini PIN: dukaan par be taalaa." },
      { icon: "👋", text: "Shared phone par logout karo. Profile maa ek tap." },
      { icon: "📸", text: "Chaheraano photo kyaay joito nathi. Fakt product photo." },
      { icon: "🌙", text: "Auto-lock: app jaate bandh thai jaay." },
    ],
    task: { kind: "none", instruction: "Aaje phone lock chalu karo jo bandh hoy to." },
    quiz: {
      q: "Shared family phone. Tame…",
      options: [{ icon: "🔓", label: "Login rahevaa do" }, { icon: "👋", label: "Kaam pachhi logout" }, { icon: "📝", label: "Cover par PIN lakho" }],
      answer: 1,
    },
  },
  "safety-3": {
    title: "Gadbad thaay to",
    cards: [
      { icon: "📞", text: "Paisani thag: kalaakmaa 1930 par call karo. Zadap jaruri." },
      { icon: "🧾", text: "Chat ane payment naa screenshot puraava raakho." },
      { icon: "👩", text: "Sakhi ne kaho. Tene pehla joyu chhe, rasto bataavshe." },
      { icon: "💪", text: "Report karvu beeji mahilaane bachaave." },
    ],
    task: { kind: "none", instruction: "1930 atyaare phone maa save karo." },
    quiz: {
      q: "Fraud laage to pehlu paglu?",
      options: [{ icon: "📞", label: "Jaldi 1930 call" }, { icon: "😴", label: "Mahino thobho" }, { icon: "🗑️", label: "Badhu delete" }],
      answer: 0,
    },
  },
  "schemes-1": {
    title: "Tamaara kaamni yojana",
    cards: [
      { icon: "🏛️", text: "Sarkaari yojana mahilaaone loan, training, subsidy aape." },
      { icon: "🎯", text: "Vadhaare: mahila + naano business + Aadhaar joiye." },
      { icon: "📋", text: "Taiyaar raakho: Aadhaar, bank passbook, ek photo, business proof." },
      { icon: "🔍", text: "Ojasvini Scheme Finder fakt e bataave je tamane malshe." },
    ],
    task: { kind: "none", instruction: "Aadhaar + passbook ek folder maa raakho." },
    quiz: {
      q: "Vadhaare yojana pehla shu maange?",
      options: [{ icon: "🎓", label: "English degree" }, { icon: "📋", label: "Aadhaar + business proof" }, { icon: "🏙️", label: "Sheherno address" }],
      answer: 1,
    },
  },
  "schemes-2": {
    title: "MUDRA loan saral",
    cards: [
      { icon: "💰", text: "MUDRA naana business ne ₹10 lakh sudhee loan, guarantee vagar." },
      { icon: "🏦", text: "Game te bankmaa Aadhaar + business details thi apply karo." },
      { icon: "📝", text: "5 line lakho: shu vecho chho, mahinaano kharch, kamaani." },
      { icon: "⏳", text: "Bank athvaadiyaa laage. Sakhi follow-up maa saathe aavshe." },
    ],
    task: { kind: "none", instruction: "Chopdimaa potaani 5-line business note lakho." },
    quiz: {
      q: "MUDRA loan ne shu joiye?",
      options: [{ icon: "🏠", label: "Ghar guarantee" }, { icon: "📝", label: "Aadhaar + business details" }, { icon: "💎", label: "Sonu" }],
      answer: 1,
    },
  },
  "schemes-3": {
    title: "Darya vagar apply karo",
    cards: [
      { icon: "🖥️", text: "Ghanaa form online chhe. Sakhi ke cyber-cafe madad karashe." },
      { icon: "❌", text: "Free yojana mate koi paisa na maange shake. Report karo." },
      { icon: "📬", text: "Reject patra kaaran bataave. Sudhaareene fari apply karo." },
      { icon: "🤝", text: "SHG ne ghanee yojnaamaa pehla tako. Ek saathe jodaavo." },
    ],
    task: { kind: "none", instruction: "Sakhi ne puchho kai yojana tamane best chhe." },
    quiz: {
      q: "Officer free yojana mate paisa maange. Tame…",
      options: [{ icon: "💸", label: "Chhupchaap aapo" }, { icon: "🚫", label: "Naa paado, report karo" }, { icon: "🏃", label: "Chhodi do" }],
      answer: 1,
    },
  },
};
