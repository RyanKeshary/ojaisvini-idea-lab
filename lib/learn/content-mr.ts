import type { LessonContent } from "./catalog";

/** Full Marathi catalog: 8 journeys × 3 lessons. */
export const MR: Record<string, LessonContent> = {
  "phone-1": {
    title: "Phone chya basic goshti",
    cards: [
      { icon: "🔋", text: "Ratri charge kara. Battery sampali ki dukaan band." },
      { icon: "📶", text: "Trikon resha network dakhavtat. 1 resha WhatsApp la pureshi." },
      { icon: "🔊", text: "Bajucha button awazacha. Order alert sathi sound chalu theva." },
      { icon: "🏠", text: "Gol button nehmi ghari neta. Kahi bigdat nahi." },
    ],
    task: { kind: "none", instruction: "Home button shodha, don vela daba." },
    quiz: {
      q: "Ghari konta button neta?",
      options: [{ icon: "🏠", label: "Home" }, { icon: "🔋", label: "Battery" }, { icon: "📷", label: "Camera" }],
      answer: 0,
    },
  },
  "phone-2": {
    title: "WhatsApp aani photo",
    cards: [
      { icon: "💬", text: "WhatsApp hirva icon aahe. Buyer shi bolna ithe hota." },
      { icon: "📷", text: "Camera icon ne photo. Product photo ithun suru." },
      { icon: "🖼️", text: "Gallery madhye saglya photo. Samanachi photo ithe milel." },
      { icon: "⌨️", text: "Keyboard cha mic button bollela lihito." },
    ],
    task: { kind: "none", instruction: "Gallery ughada, navin photo shodha." },
    quiz: {
      q: "Photo kuthe rahatat?",
      options: [{ icon: "💬", label: "WhatsApp" }, { icon: "🖼️", label: "Gallery" }, { icon: "⏰", label: "Ghadyal" }],
      answer: 1,
    },
  },
  "phone-3": {
    title: "Internet aani recharge",
    cards: [
      { icon: "📶", text: "Recharge ne data milto. Balance dukaandara kadun vichara." },
      { icon: "📴", text: "Ojasvini kaam save thevte. Network aalyavar pathvel." },
      { icon: "🔒", text: "Phone la PIN lava, mhanje koni dukaan ughadnar nahi." },
      { icon: "🆘", text: "Adaklat tar pratyek screen var Aika aani Sakhi button aahe." },
    ],
    task: { kind: "none", instruction: "Varchya menu tun data ekda off-on kara." },
    quiz: {
      q: "Network nasel tar kaamacha kay?",
      options: [{ icon: "🗑️", label: "Gela" }, { icon: "💾", label: "Save, nanter jail" }, { icon: "🔒", label: "Lock" }],
      answer: 1,
    },
  },
  "upi-1": {
    title: "UPI mhanje kay?",
    cards: [
      { icon: "💸", text: "UPI sekandat buyer kadun tumchya paryant paisa pohochavte." },
      { icon: "🏦", text: "Tumchya bank khaatyala jodta. Navin khata nako." },
      { icon: "🆔", text: "Tumchi UPI ID name@bank sarkhi. Paise ghyayla hich vaata." },
      { icon: "🆓", text: "UPI var paise ghyayla kahi charge nahi." },
    ],
    task: { kind: "upi", instruction: "Khali practice kara: ₹150 liha, send daba. Khote paise." },
    quiz: {
      q: "Paise ghyayla kay vaatnar?",
      options: [{ icon: "🔑", label: "ATM PIN" }, { icon: "🆔", label: "UPI ID" }, { icon: "📷", label: "Photo" }],
      answer: 1,
    },
  },
  "upi-2": {
    title: "Pahila UPI payment",
    cards: [
      { icon: "1️⃣", text: "Buyer dukaan link var Pay dabto." },
      { icon: "2️⃣", text: "Swatachya UPI app madhye PIN ne approve karto." },
      { icon: "3️⃣", text: "Tumhala alert + order diste. Paisa banket pohochto." },
      { icon: "🧾", text: "Pratyek payment chi receipt bante. Orders madhye paha." },
    ],
    task: { kind: "upi", instruction: "₹300 ne parat practice kara. Success screen paha." },
    quiz: {
      q: "UPI PIN kon takto?",
      options: [{ icon: "🧕", label: "Buyer" }, { icon: "👩", label: "Tumhi" }, { icon: "👨", label: "Manager" }],
      answer: 0,
    },
  },
  "upi-3": {
    title: "UPI safety niyam",
    cards: [
      { icon: "🚫", text: "Swatacha UPI PIN kiwa OTP konalahi KADHIHI deu naka. Bank wale kadhi magat nahi." },
      { icon: "👁️", text: "Paise GHYAYLA PIN lagat nahi. Magitala tar fraud aahe." },
      { icon: "🔍", text: "Payer cha naav tapasa. Olakh nasel tar thamba." },
      { icon: "📞", text: "Fasavnuk vatli tar lagech 1930 (cyber helpline) la call kara." },
    ],
    task: { kind: "none", instruction: "Safety niyam mothyane bola: majha PIN fakta majha." },
    quiz: {
      q: "Koni paise pathvayla PIN magto. Tumhi…",
      options: [{ icon: "✅", label: "Dya" }, { icon: "🚫", label: "Nakar dya, fraud aahe" }, { icon: "⏳", label: "Nanter dya" }],
      answer: 1,
    },
  },
  "whatsapp-1": {
    title: "WhatsApp Business basics",
    cards: [
      { icon: "🏪", text: "WhatsApp Business phone var free dukaan aahe." },
      { icon: "📝", text: "Dukaan cha naav, photo, timing ekda set kara." },
      { icon: "⚡", text: "Quick reply ne common prashnanna ek-tap uttar." },
      { icon: "🏷️", text: "Label lava: navin, paid, dyaycha aahe." },
    ],
    task: { kind: "whatsapp", instruction: "Khali ek catalog item banva: naav + kimmat." },
    quiz: {
      q: "Buyer la product kay dakhavta?",
      options: [{ icon: "📢", label: "Status" }, { icon: "🗂️", label: "Catalog" }, { icon: "🎮", label: "Game" }],
      answer: 1,
    },
  },
  "whatsapp-2": {
    title: "Buyer shi bolna",
    cards: [
      { icon: "👋", text: "Lagech namaskar kara. Jalad uttar jast vikta." },
      { icon: "📸", text: "Magitalyavar taji photo pathva. Dukaan walich photo." },
      { icon: "💰", text: "Kimmat vajna sah spasht sanga: 250g loncha ₹150." },
      { icon: "🙏", text: "Delivery nanter thanks bola, review maga." },
    ],
    task: { kind: "whatsapp", instruction: "Veglya kimmatichi dusri item joda." },
    quiz: {
      q: "Kimmat vicharlyavar best uttar?",
      options: [{ icon: "🤫", label: "Uttar nahi" }, { icon: "💰", label: "250g ₹150, ya aathvdyat taja" }, { icon: "❓", label: "Tumhi sanga" }],
      answer: 1,
    },
  },
  "whatsapp-3": {
    title: "Viknare broadcast",
    cards: [
      { icon: "📣", text: "Ek message saglyanna: navin maal, san offer." },
      { icon: "📅", text: "Aathvdyatun ekda, sakali. Roz message tras deto." },
      { icon: "🖼️", text: "Photo nehmi joda. Photo wale message 3x viktat." },
      { icon: "🚫", text: "Dusryancha offer forward karu naka. Fakta swatachi dukaan." },
    ],
    task: { kind: "none", instruction: "Best product sathi ek broadcast ola liha." },
    quiz: {
      q: "Broadcast kiti vela?",
      options: [{ icon: "📅", label: "Aathvdyatun ekda" }, { icon: "⏰", label: "Pratyek tasi" }, { icon: "🌙", label: "Roz madhyaratri" }],
      answer: 0,
    },
  },
  "photo-1": {
    title: "Prakash mhanje sagla",
    cards: [
      { icon: "🪟", text: "Samaan khidki-darvajya javal theva. Un free studio aahe." },
      { icon: "🚫", text: "Flash kadhihi vapru naka. Rang jalun jatat." },
      { icon: "⬅️", text: "Prakash bajune yeudya, mageun nako." },
      { icon: "🌤️", text: "Sakal 8–10 photo chi best vel aahe." },
    ],
    task: { kind: "photo", instruction: "Light tips paha, kholit kay aahe tick kara." },
    quiz: {
      q: "Best prakash konta?",
      options: [{ icon: "📸", label: "Flash" }, { icon: "🪟", label: "Khidkicha un" }, { icon: "🕯️", label: "Mombatti" }],
      answer: 1,
    },
  },
  "photo-2": {
    title: "Yogya frame",
    cards: [
      { icon: "🎯", text: "Samaan madhye, chari bajula jaga." },
      { icon: "📐", text: "Phone saral dhara, vakda nako." },
      { icon: "🧹", text: "Magche chamche-batlya kadha." },
      { icon: "🔍", text: "Screen var samanala touch kara (focus), mag click." },
    ],
    task: { kind: "photo", instruction: "Frame practice: pratyek niyam try karun tick kara." },
    quiz: {
      q: "Samana mage kay asava?",
      options: [{ icon: "🧹", label: "Swachh mokla" }, { icon: "🍽️", label: "Bharlela kitchen" }, { icon: "📺", label: "Chalu TV" }],
      answer: 0,
    },
  },
  "photo-3": {
    title: "Viknare 3 photo",
    cards: [
      { icon: "1️⃣", text: "Photo 1: purna samaan, samorun." },
      { icon: "2️⃣", text: "Photo 2: close-up (lonchacha tel, bharatkam)." },
      { icon: "3️⃣", text: "Photo 3: packing kiwa vajan (taraju var dibba)." },
      { icon: "✅", text: "Ojasvini madhye 4 paryant photo. Jast angle, jast vishwas." },
    ],
    task: { kind: "none", instruction: "Pudhchya product che 3 photo plan kara." },
    quiz: {
      q: "Konta set best vikel?",
      options: [{ icon: "1️⃣", label: "Ek gadad photo" }, { icon: "3️⃣", label: "Front + close-up + packing" }, { icon: "🤳", label: "Selfie" }],
      answer: 1,
    },
  },
  "pricing-1": {
    title: "Kharch olakha",
    cards: [
      { icon: "🧾", text: "Kharch = sahitya + packing + tumcha vel. Tinihi liha." },
      { icon: "⚖️", text: "Example: 1kg kairi ₹80 + dibba ₹20 + tel-masala ₹40 = ₹140." },
      { icon: "➗", text: "Jevdhe dibbe, tevdhane bhaga. 4 dibbe → ₹35 per dibba." },
      { icon: "📓", text: "Ek vahi theva. Pratyek product ek paan." },
    ],
    task: { kind: "none", instruction: "Magchya product cha tinihi kharch vahit liha." },
    quiz: {
      q: "Kharchat kay?",
      options: [{ icon: "🧾", label: "Sahitya + packing + vel" }, { icon: "🎲", label: "Andaj" }, { icon: "0️⃣", label: "Kahi nahi" }],
      answer: 0,
    },
  },
  "pricing-2": {
    title: "Kimmat tharva",
    cards: [
      { icon: "➕", text: "Kimmat = kharch + napha. 30–50% napha changla." },
      { icon: "🏘️", text: "Jawalchi dukana paha. Tyach band madhye raha, sarvat swast nako." },
      { icon: "⚖️", text: "Example: ₹35 kharch → ₹50–₹60 la vika." },
      { icon: "📉", text: "Khup swast ghabaravta. Yogya kimmat vishwas banavte." },
    ],
    task: { kind: "none", instruction: "30–50% niyamane best product chi kimmat lava." },
    quiz: {
      q: "Kharch ₹40. Yogya kimmat?",
      options: [{ icon: "📉", label: "₹35" }, { icon: "✅", label: "₹55" }, { icon: "🚀", label: "₹200" }],
      answer: 1,
    },
  },
  "pricing-3": {
    title: "Chalanare discount",
    cards: [
      { icon: "🎁", text: "Combo: ₹300 che 2 dibbe ₹280 la. Combo jast vikta." },
      { icon: "🪔", text: "San offer fakta 7 divas. Ghai vikta." },
      { icon: "🚫", text: "Kharcha khali kadhihi nako. ₹500 var free delivery." },
      { icon: "📣", text: "Offer ekda WhatsApp broadcast var sanga." },
    ],
    task: { kind: "none", instruction: "Dukaan sathi ek combo offer banva." },
    quiz: {
      q: "Safe discount niyam?",
      options: [{ icon: "🚫", label: "Kharcha khali kadhihi nahi" }, { icon: "🎁", label: "Nehmi 50% off" }, { icon: "🤫", label: "Kimmati lapva" }],
      answer: 0,
    },
  },
  "packing-1": {
    title: "Pro sarkhi packing",
    cards: [
      { icon: "🫙", text: "Anna: havaband dibba, tok pusun ghya, ghatt seal." },
      { icon: "🧵", text: "Kapde: ghadi ghala, poly bag, mag paper bag." },
      { icon: "🏷️", text: "Pratyek pack var label: naav, vajan, tarikh." },
      { icon: "💧", text: "Lonchache dibbe saral. Varli bajuchi khun kara." },
    ],
    task: { kind: "none", instruction: "Ek product purna pack karun label tapasa." },
    quiz: {
      q: "Pratyek pack var kay?",
      options: [{ icon: "🏷️", label: "Naav + vajan + tarikh" }, { icon: "📰", label: "Fakta pepar" }, { icon: "❌", label: "Kahi nahi" }],
      answer: 0,
    },
  },
  "packing-2": {
    title: "Delivery paryay",
    cards: [
      { icon: "🚶", text: "Jawalche buyer: swataha pickup free aani jalad." },
      { icon: "🛵", text: "Gavat: gharatla koni kiwa Sakhi deun yeil." },
      { icon: "📮", text: "Lamb order: post/courier. ₹30 delivery joda." },
      { icon: "📦", text: "Village pooling: Sakhi saglyanche order ekatra, kharch vatun." },
    ],
    task: { kind: "none", instruction: "Default nivda: pickup, swataha-delivery, kiwa courier." },
    quiz: {
      q: "Lamb order swast kase?",
      options: [{ icon: "✈️", label: "Viman" }, { icon: "📦", label: "Pooled pickup" }, { icon: "🚶", label: "200km payi" }],
      answer: 1,
    },
  },
  "packing-3": {
    title: "Takrar shantpane",
    cards: [
      { icon: "📞", text: "Takrar aadhich: purna aika, ekda sorry bola, photo maga." },
      { icon: "🔄", text: "Phutla/kharab: badla kiwa refund. Ek nuksan daha buyer vachavta." },
      { icon: "📓", text: "Pratyek takrar liha. Parat ali tar recipe/packing badla." },
      { icon: "⭐", text: "Changla sodavla tar ragavlele buyer sarvat mothe fan." },
    ],
    task: { kind: "none", instruction: "Tumcha replacement vachan ek olit liha." },
    quiz: {
      q: "Dibba phutun aala. Tumhi…",
      options: [{ icon: "🙈", label: "Dur laksh" }, { icon: "🔄", label: "Badla kiwa refund" }, { icon: "😡", label: "Bhanda" }],
      answer: 1,
    },
  },
  "safety-1": {
    title: "Fasavnuk olakha",
    cards: [
      { icon: "🎣", text: "Lalach wale order (100 dibbe, advance dya) bahutek saple astat." },
      { icon: "🔗", text: "Olakh nasalelya link var kadhihi dabau naka. Buyer tumchi shop link vaprel." },
      { icon: "💳", text: "OTP, PIN, CVV konalahi nako. Kadhihi nako." },
      { icon: "🕵️", text: "Paha: buyer saral prashnanna uttar deto ka? Fraud ghaikarto." },
    ],
    task: { kind: "none", instruction: "Aaj gharat ekala OTP niyam sanga." },
    quiz: {
      q: "Buyer paise dyayla OTP magto. He…",
      options: [{ icon: "✅", label: "Normal" }, { icon: "🚨", label: "Fraud" }, { icon: "🤷", label: "Gondhal" }],
      answer: 1,
    },
  },
  "safety-2": {
    title: "Safe phone savayi",
    cards: [
      { icon: "🔒", text: "Phone lock + Ojasvini PIN: dukaan var don kula." },
      { icon: "👋", text: "Shared phone var logout kara. Profile madhye ek tap." },
      { icon: "📸", text: "Chehryacha photo kuthehi nako. Fakta product photo." },
      { icon: "🌙", text: "Auto-lock: app swatahun band hota." },
    ],
    task: { kind: "none", instruction: "Aaj phone lock chalu kara jar band asel tar." },
    quiz: {
      q: "Shared family phone. Tumhi…",
      options: [{ icon: "🔓", label: "Login rahu dya" }, { icon: "👋", label: "Kam nanter logout" }, { icon: "📝", label: "Cover var PIN liha" }],
      answer: 1,
    },
  },
  "safety-3": {
    title: "Chuk jhali tar",
    cards: [
      { icon: "📞", text: "Paishachi fasavnuk: tasabharat 1930 la call kara. Veg mahatvacha." },
      { icon: "🧾", text: "Chat aani payment che screenshot purava theva." },
      { icon: "👩", text: "Sakhi la sanga. Tine aadhi pahila aahe, rasta dakhavel." },
      { icon: "💪", text: "Report kela tar pudhchi mahila vachte." },
    ],
    task: { kind: "none", instruction: "1930 aattach phone madhye save kara." },
    quiz: {
      q: "Fasavnuk vatlyavar pahila paul?",
      options: [{ icon: "📞", label: "Lagech 1930 call" }, { icon: "😴", label: "Mahina thamba" }, { icon: "🗑️", label: "Sagla delete" }],
      answer: 0,
    },
  },
  "schemes-1": {
    title: "Tumchya kamachya yojana",
    cards: [
      { icon: "🏛️", text: "Sarkari yojana mahilanna loan, training, subsidy detat." },
      { icon: "🎯", text: "Bahutek: mahila + lahan business + Aadhaar lagta." },
      { icon: "📋", text: "Tayyar theva: Aadhaar, bank passbook, ek photo, business proof." },
      { icon: "🔍", text: "Ojasvini Scheme Finder fakt tech dakhavto je tumhala milel." },
    ],
    task: { kind: "none", instruction: "Aadhaar + passbook ek folder madhye theva." },
    quiz: {
      q: "Bahutek yojana aadhi kay magtat?",
      options: [{ icon: "🎓", label: "English degree" }, { icon: "📋", label: "Aadhaar + business proof" }, { icon: "🏙️", label: "Shaharacha patta" }],
      answer: 1,
    },
  },
  "schemes-2": {
    title: "MUDRA loan sopya bhashet",
    cards: [
      { icon: "💰", text: "MUDRA lahan business la ₹10 lakh paryant loan, guarantee nako." },
      { icon: "🏦", text: "Kontyahi banket Aadhaar + business details ne apply kara." },
      { icon: "📝", text: "5 oli liha: kay vikta, mahinyacha kharch, kamai." },
      { icon: "⏳", text: "Bank aathvade ghete. Sakhi follow-up la sobat yeil." },
    ],
    task: { kind: "none", instruction: "Vahit swatachi 5-oli business note liha." },
    quiz: {
      q: "MUDRA loan la kay lagta?",
      options: [{ icon: "🏠", label: "Ghar guarantee" }, { icon: "📝", label: "Aadhaar + business details" }, { icon: "💎", label: "Sona" }],
      answer: 1,
    },
  },
  "schemes-3": {
    title: "Bhitishivay apply kara",
    cards: [
      { icon: "🖥️", text: "Barech form online aahet. Sakhi kiwa cyber-cafe madat karel." },
      { icon: "❌", text: "Free yojne sathi koni paise magu shakat nahi. Report kara." },
      { icon: "📬", text: "Reject patra karan sangta. Durusta karun parat apply kara." },
      { icon: "🤝", text: "SHG la baryach yojnanmadhye aadhi sandhi. Ekala joda." },
    ],
    task: { kind: "none", instruction: "Sakhi la vichara konti yojana tumhala best aahe." },
    quiz: {
      q: "Officer free yojne sathi paise magto. Tumhi…",
      options: [{ icon: "💸", label: "Gupchup dya" }, { icon: "🚫", label: "Nakar dya, report kara" }, { icon: "🏃", label: "Sodun dya" }],
      answer: 1,
    },
  },
};
