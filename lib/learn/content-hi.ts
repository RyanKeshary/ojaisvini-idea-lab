import type { LessonContent } from "./catalog";

/** Full Hindi catalog: 8 journeys × 3 lessons. */
export const HI: Record<string, LessonContent> = {
  "phone-1": {
    title: "Phone ki basic baatein",
    cards: [
      { icon: "🔋", text: "Raat ko charge karo. Battery khatam to dukaan band." },
      { icon: "📶", text: "Triangle wali lines network batati hain. 1 line WhatsApp ke liye kaafi." },
      { icon: "🔊", text: "Side ke button se awaaz. Order alert ke liye sound on rakho." },
      { icon: "🏠", text: "Gol button hamesha home le jaata hai. Kuch bigadta nahin." },
    ],
    task: { kind: "none", instruction: "Home button dhoondo, do baar dabao." },
    quiz: {
      q: "Home kaunsa button le jaata hai?",
      options: [{ icon: "🏠", label: "Home" }, { icon: "🔋", label: "Battery" }, { icon: "📷", label: "Camera" }],
      answer: 0,
    },
  },
  "phone-2": {
    title: "WhatsApp aur photo",
    cards: [
      { icon: "💬", text: "WhatsApp hara icon hai. Buyer se baat yahin hoti hai." },
      { icon: "📷", text: "Camera icon se photo. Product photo yahin se shuru." },
      { icon: "🖼️", text: "Gallery mein saari photo. Samaan ki photo yahin milegi." },
      { icon: "⌨️", text: "Keyboard ka mic button bola hua likh deta hai." },
    ],
    task: { kind: "none", instruction: "Gallery kholo, sabse nayi photo dhoondo." },
    quiz: {
      q: "Photo kahan rehti hain?",
      options: [{ icon: "💬", label: "WhatsApp" }, { icon: "🖼️", label: "Gallery" }, { icon: "⏰", label: "Ghadi" }],
      answer: 1,
    },
  },
  "phone-3": {
    title: "Internet aur recharge",
    cards: [
      { icon: "📶", text: "Recharge se data milta hai. Balance dukandaar se pata karo." },
      { icon: "📴", text: "Ojasvini kaam save rakhti hai. Network aate hi bhej degi." },
      { icon: "🔒", text: "Phone mein PIN lagao, taaki koi dukaan na khole." },
      { icon: "🆘", text: "Atko to har screen par Suno aur Sakhi button hai." },
    ],
    task: { kind: "none", instruction: "Upar ke menu se data ek baar off-on karo." },
    quiz: {
      q: "Network na ho to kaam ka kya?",
      options: [{ icon: "🗑️", label: "Gaya" }, { icon: "💾", label: "Save, baad mein jayega" }, { icon: "🔒", label: "Lock" }],
      answer: 1,
    },
  },
  "upi-1": {
    title: "UPI kya hai?",
    cards: [
      { icon: "💸", text: "UPI secondon mein buyer se tum tak paisa pahunchata hai." },
      { icon: "🏦", text: "Tumhare bank account se judta hai. Naya account nahin chahiye." },
      { icon: "🆔", text: "Tumhari UPI ID name@bank jaisi. Paise lene ke liye yahi baanto." },
      { icon: "🆓", text: "UPI par paise lene ka koi charge nahin." },
    ],
    task: { kind: "upi", instruction: "Neeche practice karo: ₹150 likho, send dabao. Nakli paise." },
    quiz: {
      q: "Paise lene ke liye kya baantogi?",
      options: [{ icon: "🔑", label: "ATM PIN" }, { icon: "🆔", label: "UPI ID" }, { icon: "📷", label: "Photo" }],
      answer: 1,
    },
  },
  "upi-2": {
    title: "Pehla UPI payment",
    cards: [
      { icon: "1️⃣", text: "Buyer dukaan link par Pay dabata hai." },
      { icon: "2️⃣", text: "Apne UPI app mein apne PIN se approve karta hai." },
      { icon: "3️⃣", text: "Tumhe alert + order dikhta hai. Paisa bank pahunchta hai." },
      { icon: "🧾", text: "Har payment ki receipt banti hai. Orders mein dekho." },
    ],
    task: { kind: "upi", instruction: "₹300 se dobara practice karo. Success screen dekho." },
    quiz: {
      q: "UPI PIN kaun daalta hai?",
      options: [{ icon: "🧕", label: "Buyer" }, { icon: "👩", label: "Tum" }, { icon: "👨", label: "Manager" }],
      answer: 0,
    },
  },
  "upi-3": {
    title: "UPI safety ke niyam",
    cards: [
      { icon: "🚫", text: "Apna UPI PIN ya OTP kisi ko KABHI na do. Bank wale kabhi nahin maangte." },
      { icon: "👁️", text: "Paise LENE ke liye PIN nahin lagta. Maange to fraud hai." },
      { icon: "🔍", text: "Payer ka naam check karo. Anjaan naam: ruko." },
      { icon: "📞", text: "Thagi lage to turant 1930 (cyber helpline) par call karo." },
    ],
    task: { kind: "none", instruction: "Safety niyam zor se bolo: mera PIN sirf mera." },
    quiz: {
      q: "Koi paise bhejne ke liye PIN maange. Tum…",
      options: [{ icon: "✅", label: "De do" }, { icon: "🚫", label: "Mana karo, fraud hai" }, { icon: "⏳", label: "Baad mein do" }],
      answer: 1,
    },
  },
  "whatsapp-1": {
    title: "WhatsApp Business basics",
    cards: [
      { icon: "🏪", text: "WhatsApp Business phone par free dukaan hai." },
      { icon: "📝", text: "Dukaan ka naam, photo, timing ek baar set karo." },
      { icon: "⚡", text: "Quick reply se aam sawalon ka ek-tap jawab." },
      { icon: "🏷️", text: "Label lagao: naya, paid, deliver karna hai." },
    ],
    task: { kind: "whatsapp", instruction: "Neeche ek catalog item banao: naam + daam." },
    quiz: {
      q: "Buyer ko product kya dikhata hai?",
      options: [{ icon: "📢", label: "Status" }, { icon: "🗂️", label: "Catalog" }, { icon: "🎮", label: "Game" }],
      answer: 1,
    },
  },
  "whatsapp-2": {
    title: "Buyer se baat",
    cards: [
      { icon: "👋", text: "Jaldi namaste karo. Tez jawab zyada bechta hai." },
      { icon: "📸", text: "Maange par taazi photo bhejo. Dukaan wali hi photo." },
      { icon: "💰", text: "Daam wazan ke saath saaf bolo: 250g achaar ₹150." },
      { icon: "🙏", text: "Delivery ke baad thanks bolo, review maango." },
    ],
    task: { kind: "whatsapp", instruction: "Alag daam ka dusra item jodo." },
    quiz: {
      q: "Daam pooche to best jawab?",
      options: [{ icon: "🤫", label: "Jawab nahin" }, { icon: "💰", label: "250g ₹150, is hafte taaza" }, { icon: "❓", label: "Tum batao" }],
      answer: 1,
    },
  },
  "whatsapp-3": {
    title: "Bikne wale broadcast",
    cards: [
      { icon: "📣", text: "Ek message sabko: naya maal, tyohar offer." },
      { icon: "📅", text: "Hafte mein ek baar, subah. Roz message pareshan karta hai." },
      { icon: "🖼️", text: "Photo hamesha jodo. Photo wale message 3x bechte hain." },
      { icon: "🚫", text: "Dusron ke offer forward mat karo. Sirf apni dukaan." },
    ],
    task: { kind: "none", instruction: "Apne best product ki ek broadcast line likho." },
    quiz: {
      q: "Broadcast kitni baar?",
      options: [{ icon: "📅", label: "Hafte mein ek" }, { icon: "⏰", label: "Har ghante" }, { icon: "🌙", label: "Roz aadhi raat" }],
      answer: 0,
    },
  },
  "photo-1": {
    title: "Roshni sab kuch hai",
    cards: [
      { icon: "🪟", text: "Samaan khidki-darwaze ke paas rakho. Dhoop free studio hai." },
      { icon: "🚫", text: "Flash kabhi mat use karo. Rang jal jaate hain." },
      { icon: "⬅️", text: "Roshni side se aaye, peeche se nahin." },
      { icon: "🌤️", text: "Subah 8–10 photo ka best time hai." },
    ],
    task: { kind: "photo", instruction: "Light tips dekho, kamre mein kya hai tick karo." },
    quiz: {
      q: "Best roshni kaunsi?",
      options: [{ icon: "📸", label: "Flash" }, { icon: "🪟", label: "Khidki ki dhoop" }, { icon: "🕯️", label: "Mombatti" }],
      answer: 1,
    },
  },
  "photo-2": {
    title: "Sahi frame",
    cards: [
      { icon: "🎯", text: "Samaan beech mein, chaaron taraf jagah." },
      { icon: "📐", text: "Phone seedha pakdo, tedha nahin." },
      { icon: "🧹", text: "Peeche ke chammach-bottle hatao." },
      { icon: "🔍", text: "Screen par samaan ko touch karo (focus), phir click." },
    ],
    task: { kind: "photo", instruction: "Frame practice: har नियम try karke tick karo." },
    quiz: {
      q: "Samaan ke peeche kya ho?",
      options: [{ icon: "🧹", label: "Saaf khaali" }, { icon: "🍽️", label: "Bhara kitchen" }, { icon: "📺", label: "Chalu TV" }],
      answer: 0,
    },
  },
  "photo-3": {
    title: "Bechne wali 3 photo",
    cards: [
      { icon: "1️⃣", text: "Photo 1: poora samaan, saamne se." },
      { icon: "2️⃣", text: "Photo 2: close-up (achaar ka tel, kadhai)." },
      { icon: "3️⃣", text: "Photo 3: packing ya wazan (tarazu par dibba)." },
      { icon: "✅", text: "Ojasvini mein 4 tak photo. Zyada angle, zyada bharosa." },
    ],
    task: { kind: "none", instruction: "Agle product ki 3 photo plan karo." },
    quiz: {
      q: "Kaunsa set best bechega?",
      options: [{ icon: "1️⃣", label: "Ek andheri photo" }, { icon: "3️⃣", label: "Front + close-up + packing" }, { icon: "🤳", label: "Selfie" }],
      answer: 1,
    },
  },
  "pricing-1": {
    title: "Laagat jaano",
    cards: [
      { icon: "🧾", text: "Laagat = samaan + packing + tumhara time. Teeno likho." },
      { icon: "⚖️", text: "Example: 1kg aam ₹80 + dibba ₹20 + tel-masala ₹40 = ₹140." },
      { icon: "➗", text: "Jitne dibbe bane, divide karo. 4 dibbe → ₹35 per dibba." },
      { icon: "📓", text: "Ek copy rakho. Har product ek page." },
    ],
    task: { kind: "none", instruction: "Pichle product ki teenon laagat copy mein likho." },
    quiz: {
      q: "Laagat mein kya?",
      options: [{ icon: "🧾", label: "Samaan + packing + time" }, { icon: "🎲", label: "Andaaza" }, { icon: "0️⃣", label: "Kuch nahin" }],
      answer: 0,
    },
  },
  "pricing-2": {
    title: "Daam lagao",
    cards: [
      { icon: "➕", text: "Daam = laagat + munafa. 30–50% munafa healthy hai." },
      { icon: "🏘️", text: "Aas-paas ki dukaan dekho. Same band mein raho, sabse saste nahin." },
      { icon: "⚖️", text: "Example: ₹35 laagat → ₹50–₹60 becho." },
      { icon: "📉", text: "Bahut sasta daraata hai. Sahi daam bharosa banata hai." },
    ],
    task: { kind: "none", instruction: "30–50% नियम se best product ka daam lagao." },
    quiz: {
      q: "Laagat ₹40. Sahi daam?",
      options: [{ icon: "📉", label: "₹35" }, { icon: "✅", label: "₹55" }, { icon: "🚀", label: "₹200" }],
      answer: 1,
    },
  },
  "pricing-3": {
    title: "Chalne wale discount",
    cards: [
      { icon: "🎁", text: "Combo: ₹300 ke 2 dibbe ₹280 mein. Combo zyada bikta hai." },
      { icon: "🪔", text: "Tyohar offer sirf 7 din. Jaldi bikta hai." },
      { icon: "🚫", text: "Laagat se neeche kabhi nahin. ₹500 ke upar free delivery." },
      { icon: "📣", text: "Offer ek baar WhatsApp broadcast par batao." },
    ],
    task: { kind: "none", instruction: "Dukaan ke liye ek combo offer banao." },
    quiz: {
      q: "Safe discount नियम?",
      options: [{ icon: "🚫", label: "Laagat se neeche kabhi nahin" }, { icon: "🎁", label: "Hamesha 50% off" }, { icon: "🤫", label: "Daam chhupao" }],
      answer: 0,
    },
  },
  "packing-1": {
    title: "Pro jaisi packing",
    cards: [
      { icon: "🫙", text: "Khana: airtight dibba, kinara poncho, tight seal." },
      { icon: "🧵", text: "Kapde: fold karo, poly bag, phir paper bag." },
      { icon: "🏷️", text: "Har pack par label: naam, wazan, date." },
      { icon: "💧", text: "Achaar ke dibbe seedhe. Upar ka nishan lagao." },
    ],
    task: { kind: "none", instruction: "Ek product poora pack karke label check karo." },
    quiz: {
      q: "Har pack par kya?",
      options: [{ icon: "🏷️", label: "Naam + wazan + date" }, { icon: "📰", label: "Sirf akhbaar" }, { icon: "❌", label: "Kuch nahin" }],
      answer: 0,
    },
  },
  "packing-2": {
    title: "Delivery options",
    cards: [
      { icon: "🚶", text: "Paas ke buyer: khud pickup free aur fast." },
      { icon: "🛵", text: "Gaon mein: ghar ka koi ya Sakhi de aaye." },
      { icon: "📮", text: "Door ke order: post/courier. ₹30 delivery jodo." },
      { icon: "📦", text: "Village pooling: Sakhi sabke order ek saath, kharcha baant ke." },
    ],
    task: { kind: "none", instruction: "Default chuno: pickup, self-delivery, ya courier." },
    quiz: {
      q: "Door ke order saste kaise?",
      options: [{ icon: "✈️", label: "Flight" }, { icon: "📦", label: "Pooled pickup" }, { icon: "🚶", label: "200km paidal" }],
      answer: 1,
    },
  },
  "packing-3": {
    title: "Shikayat shaanti se",
    cards: [
      { icon: "📞", text: "Shikayat pehle: poora suno, ek baar sorry, photo maango." },
      { icon: "🔄", text: "Toota/kharaab: badlo ya refund. Ek nuksaan dus buyer bachata hai." },
      { icon: "📓", text: "Har shikayat likho. Repeat ho to recipe/packing badlo." },
      { icon: "⭐", text: "Achhe se solve karo, naraaz buyer sabse bada fan." },
    ],
    task: { kind: "none", instruction: "Apna replacement vaada ek line mein likho." },
    quiz: {
      q: "Dibba toota aaya. Tum…",
      options: [{ icon: "🙈", label: "Ignore" }, { icon: "🔄", label: "Badlo ya refund" }, { icon: "😡", label: "Jhagdo" }],
      answer: 1,
    },
  },
  "safety-1": {
    title: "Fraud pehchano",
    cards: [
      { icon: "🎣", text: "Lalach wale order (100 dibbe, advance do) aksar jaal hote hain." },
      { icon: "🔗", text: "Anjaan link kabhi mat dabao. Buyer tumhara shop link use kare." },
      { icon: "💳", text: "OTP, PIN, CVV kisi ko nahin. Kabhi nahin." },
      { icon: "🕵️", text: "Dekho: kya buyer seedhe sawalon ka jawab deta hai? Fraud jaldi karta hai." },
    ],
    task: { kind: "none", instruction: "Aaj ghar mein ek ko OTP नियम batao." },
    quiz: {
      q: "Buyer paise bhejne ke liye OTP maange. Ye…",
      options: [{ icon: "✅", label: "Normal" }, { icon: "🚨", label: "Fraud" }, { icon: "🤷", label: "Confusing" }],
      answer: 1,
    },
  },
  "safety-2": {
    title: "Safe phone aadatein",
    cards: [
      { icon: "🔒", text: "Phone lock + Ojasvini PIN: dukaan par do taale." },
      { icon: "👋", text: "Shared phone par logout karo. Profile mein ek tap." },
      { icon: "📸", text: "Chehre ki photo kahin nahin chahiye. Sirf product photo." },
      { icon: "🌙", text: "Auto-lock: app khud band ho jaata hai." },
    ],
    task: { kind: "none", instruction: "Aaj phone lock on karo agar off hai." },
    quiz: {
      q: "Shared family phone. Tum…",
      options: [{ icon: "🔓", label: "Login rehne do" }, { icon: "👋", label: "Kaam ke baad logout" }, { icon: "📝", label: "Cover par PIN likho" }],
      answer: 1,
    },
  },
  "safety-3": {
    title: "Gadbad ho to",
    cards: [
      { icon: "📞", text: "Paise ki thagi: ghanton mein 1930 par call karo. Tezi zaroori." },
      { icon: "🧾", text: "Chat aur payment ke screenshot saboot rakho." },
      { icon: "👩", text: "Sakhi ko batao. Usne pehle dekha hai, rasta batayegi." },
      { icon: "💪", text: "Report karna agli mahila ko bachata hai." },
    ],
    task: { kind: "none", instruction: "1930 abhi phone mein save karo." },
    quiz: {
      q: "Fraud lage to pehla kadam?",
      options: [{ icon: "📞", label: "Jaldi 1930 call" }, { icon: "😴", label: "Mahina ruko" }, { icon: "🗑️", label: "Sab delete" }],
      answer: 0,
    },
  },
  "schemes-1": {
    title: "Tumhare kaam ki yojana",
    cards: [
      { icon: "🏛️", text: "Sarkari yojana mahilaon ko loan, training, subsidy deti hain." },
      { icon: "🎯", text: "Zyada tar: mahila + chhota business + Aadhaar chahiye." },
      { icon: "📋", text: "Tayyar rakho: Aadhaar, bank passbook, ek photo, business proof." },
      { icon: "🔍", text: "Ojasvini Scheme Finder sirf wahi dikhata hai jo tumhe milega." },
    ],
    task: { kind: "none", instruction: "Aadhaar + passbook ek folder mein rakho." },
    quiz: {
      q: "Zyada yojana pehle kya maangti hain?",
      options: [{ icon: "🎓", label: "English degree" }, { icon: "📋", label: "Aadhaar + business proof" }, { icon: "🏙️", label: "Sheher ka pata" }],
      answer: 1,
    },
  },
  "schemes-2": {
    title: "MUDRA loan simple",
    cards: [
      { icon: "💰", text: "MUDRA chhote business ko ₹10 lakh tak loan, bina guarantee." },
      { icon: "🏦", text: "Kisi bhi bank mein Aadhaar + business details se apply karo." },
      { icon: "📝", text: "5 line likho: kya bechti ho, mahine ka kharch, kamai." },
      { icon: "⏳", text: "Bank hafte lagata hai. Sakhi follow-up mein saath degi." },
    ],
    task: { kind: "none", instruction: "Copy mein apni 5-line business note likho." },
    quiz: {
      q: "MUDRA loan ko kya chahiye?",
      options: [{ icon: "🏠", label: "Ghar guarantee" }, { icon: "📝", label: "Aadhaar + business details" }, { icon: "💎", label: "Sona" }],
      answer: 1,
    },
  },
  "schemes-3": {
    title: "Bina dar apply karo",
    cards: [
      { icon: "🖥️", text: "Kai form online hain. Sakhi ya cyber-cafe madad karega." },
      { icon: "❌", text: "Free yojana ke liye koi paise nahin maang sakta. Report karo." },
      { icon: "📬", text: "Reject letter wajah batata hai. Theek karke dobara apply karo." },
      { icon: "🤝", text: "SHG ko kai yojana mein pehle mauka. Ek se judo." },
    ],
    task: { kind: "none", instruction: "Sakhi se poocho kaunsi yojana tumhe best hai." },
    quiz: {
      q: "Officer free yojana ke liye paise maange. Tum…",
      options: [{ icon: "💸", label: "Chupke de do" }, { icon: "🚫", label: "Mana karo, report karo" }, { icon: "🏃", label: "Chhod do" }],
      answer: 1,
    },
  },
};
