import type { LessonContent } from "./catalog";

/** Full English catalog: 8 journeys × 3 lessons. */
export const EN: Record<string, LessonContent> = {
  "phone-1": {
    title: "Your phone basics",
    cards: [
      { icon: "🔋", text: "Charge every night. Low battery stops selling." },
      { icon: "📶", text: "The triangle bars show network. 1 bar is enough for WhatsApp." },
      { icon: "🔊", text: "Volume buttons are on the side. Keep sound on for order alerts." },
      { icon: "🏠", text: "The round or square button always takes you home. You cannot break anything." },
    ],
    task: { kind: "none", instruction: "Find the home button and press it twice." },
    quiz: {
      q: "Which button takes you home?",
      options: [{ icon: "🏠", label: "Home" }, { icon: "🔋", label: "Battery" }, { icon: "📷", label: "Camera" }],
      answer: 0,
    },
  },
  "phone-2": {
    title: "WhatsApp and photos",
    cards: [
      { icon: "💬", text: "WhatsApp is the green icon. Tap it to talk to buyers." },
      { icon: "📷", text: "Camera is the camera icon. Product photos start here." },
      { icon: "🖼️", text: "Gallery holds your photos. Your product photos live here." },
      { icon: "⌨️", text: "The mic button on the keyboard types what you speak." },
    ],
    task: { kind: "none", instruction: "Open the gallery and find your newest photo." },
    quiz: {
      q: "Where do your photos live?",
      options: [{ icon: "💬", label: "WhatsApp" }, { icon: "🖼️", label: "Gallery" }, { icon: "⏰", label: "Clock" }],
      answer: 1,
    },
  },
  "phone-3": {
    title: "Internet and recharge",
    cards: [
      { icon: "📶", text: "Mobile data comes from your recharge. Check balance with your operator app or shop." },
      { icon: "📴", text: "Ojasvini saves work offline. It sends when network returns." },
      { icon: "🔒", text: "Lock your phone with a PIN so others cannot open your shop." },
      { icon: "🆘", text: "Stuck? Every screen has Listen and Call Sakhi buttons." },
    ],
    task: { kind: "none", instruction: "Turn mobile data off and on once, from the top menu." },
    quiz: {
      q: "No network? What happens to your work?",
      options: [{ icon: "🗑️", label: "Lost" }, { icon: "💾", label: "Saved, sends later" }, { icon: "🔒", label: "Locked" }],
      answer: 1,
    },
  },
  "upi-1": {
    title: "What is UPI?",
    cards: [
      { icon: "💸", text: "UPI moves money from buyer to you in seconds, on the phone." },
      { icon: "🏦", text: "It connects to your bank account. No new account needed." },
      { icon: "🆔", text: "Your UPI ID looks like name@bank. Share it to receive money." },
      { icon: "🆓", text: "Receiving money on UPI costs you nothing." },
    ],
    task: { kind: "upi", instruction: "Practice below: enter ₹150 and press send. Fake money only." },
    quiz: {
      q: "What do you share to receive money?",
      options: [{ icon: "🔑", label: "ATM PIN" }, { icon: "🆔", label: "UPI ID" }, { icon: "📷", label: "Photo" }],
      answer: 1,
    },
  },
  "upi-2": {
    title: "Your first UPI payment",
    cards: [
      { icon: "1️⃣", text: "Buyer taps Pay on your shop link." },
      { icon: "2️⃣", text: "She approves in her own UPI app with her PIN." },
      { icon: "3️⃣", text: "You hear an alert and see the order. Money reaches your bank." },
      { icon: "🧾", text: "Every payment makes a receipt. Check it in Orders." },
    ],
    task: { kind: "upi", instruction: "Practice again with ₹300. Watch the success screen." },
    quiz: {
      q: "Who enters the UPI PIN?",
      options: [{ icon: "🧕", label: "The buyer" }, { icon: "👩", label: "You" }, { icon: "👨", label: "The bank manager" }],
      answer: 0,
    },
  },
  "upi-3": {
    title: "UPI safety rules",
    cards: [
      { icon: "🚫", text: "NEVER share your UPI PIN or OTP with anyone. Bank staff never ask." },
      { icon: "👁️", text: "Receiving money needs NO PIN. If an app asks for PIN to receive, it is fraud." },
      { icon: "🔍", text: "Check the payer name before accepting. Unknown names: wait." },
      { icon: "📞", text: "Scammed? Call 1930 (cyber helpline) immediately." },
    ],
    task: { kind: "none", instruction: "Say the safety rule aloud: my PIN is only mine." },
    quiz: {
      q: "Someone asks for your UPI PIN to send you money. You…",
      options: [{ icon: "✅", label: "Share it" }, { icon: "🚫", label: "Refuse, it is fraud" }, { icon: "⏳", label: "Share later" }],
      answer: 1,
    },
  },
  "whatsapp-1": {
    title: "WhatsApp Business basics",
    cards: [
      { icon: "🏪", text: "WhatsApp Business is a free shop front on your phone." },
      { icon: "📝", text: "Set your shop name, photo, and timings once." },
      { icon: "⚡", text: "Quick replies answer common questions in one tap." },
      { icon: "🏷️", text: "Labels mark buyers: new, paid, to-deliver." },
    ],
    task: { kind: "whatsapp", instruction: "Build one catalog item below: name + price." },
    quiz: {
      q: "What shows buyers your products?",
      options: [{ icon: "📢", label: "Status" }, { icon: "🗂️", label: "Catalog" }, { icon: "🎮", label: "Games" }],
      answer: 1,
    },
  },
  "whatsapp-2": {
    title: "Talking to buyers",
    cards: [
      { icon: "👋", text: "Greet fast: Namaskar! How can I help? Fast replies sell more." },
      { icon: "📸", text: "Send a fresh photo when asked. Same photo as your shop." },
      { icon: "💰", text: "Say the price clearly with weight: 250g achar ₹150." },
      { icon: "🙏", text: "After delivery, thank and ask for a review." },
    ],
    task: { kind: "whatsapp", instruction: "Add a second item with a different price." },
    quiz: {
      q: "Buyer asks the price. Best reply?",
      options: [{ icon: "🤫", label: "No reply" }, { icon: "💰", label: "250g ₹150, fresh this week" }, { icon: "❓", label: "You tell me" }],
      answer: 1,
    },
  },
  "whatsapp-3": {
    title: "Broadcasts that sell",
    cards: [
      { icon: "📣", text: "One message to many buyers: new stock, festival offer." },
      { icon: "📅", text: "Send once a week, morning time. Daily messages annoy." },
      { icon: "🖼️", text: "Always attach a photo. Messages with photos sell 3x more." },
      { icon: "🚫", text: "Never forward others' offers. Only your own shop." },
    ],
    task: { kind: "none", instruction: "Write one broadcast line for your best product." },
    quiz: {
      q: "How often to broadcast?",
      options: [{ icon: "📅", label: "Weekly" }, { icon: "⏰", label: "Hourly" }, { icon: "🌙", label: "Midnight daily" }],
      answer: 0,
    },
  },
  "photo-1": {
    title: "Light is everything",
    cards: [
      { icon: "🪟", text: "Place the product near a window or door. Daylight is free studio light." },
      { icon: "🚫", text: "Never use flash. It burns the colours." },
      { icon: "⬅️", text: "Light should fall from the side, not from behind you." },
      { icon: "🌤️", text: "Morning 8–10 is the best photo time." },
    ],
    task: { kind: "photo", instruction: "Check the light tips, then tick what your room has." },
    quiz: {
      q: "Best light for photos?",
      options: [{ icon: "📸", label: "Flash" }, { icon: "🪟", label: "Window daylight" }, { icon: "🕯️", label: "Candle" }],
      answer: 1,
    },
  },
  "photo-2": {
    title: "Frame it right",
    cards: [
      { icon: "🎯", text: "Keep the product in the middle with space around it." },
      { icon: "📐", text: "Hold the phone straight, not tilted." },
      { icon: "🧹", text: "Remove spoons, bottles, clutter behind the product." },
      { icon: "🔍", text: "Tap the product on screen to focus, then click." },
    ],
    task: { kind: "photo", instruction: "Frame practice: tick each rule as you try it." },
    quiz: {
      q: "Behind the product should be…",
      options: [{ icon: "🧹", label: "Clean and empty" }, { icon: "🍽️", label: "Full kitchen" }, { icon: "📺", label: "TV on" }],
      answer: 0,
    },
  },
  "photo-3": {
    title: "Three photos that sell",
    cards: [
      { icon: "1️⃣", text: "Photo 1: full product, front view." },
      { icon: "2️⃣", text: "Photo 2: close-up of texture (pickle oil, embroidery)." },
      { icon: "3️⃣", text: "Photo 3: packing or weight (jar on scale)." },
      { icon: "✅", text: "Ojasvini takes up to 4. More angles, more trust." },
    ],
    task: { kind: "none", instruction: "Plan your 3 photos for your next product." },
    quiz: {
      q: "Which set sells best?",
      options: [{ icon: "1️⃣", label: "One dark photo" }, { icon: "3️⃣", label: "Front + close-up + packing" }, { icon: "🤳", label: "Selfie" }],
      answer: 1,
    },
  },
  "pricing-1": {
    title: "Know your cost",
    cards: [
      { icon: "🧾", text: "Cost = material + packing + your time. Write all three." },
      { icon: "⚖️", text: "Example: 1kg mango ₹80 + jar ₹20 + oil-spice ₹40 = ₹140 cost." },
      { icon: "➗", text: "Divide by jars made. 4 jars → ₹35 per jar cost." },
      { icon: "📓", text: "Keep one notebook. One page per product." },
    ],
    task: { kind: "none", instruction: "Write your last product's three costs in the notebook." },
    quiz: {
      q: "Cost includes…",
      options: [{ icon: "🧾", label: "Material + packing + time" }, { icon: "🎲", label: "Guesswork" }, { icon: "0️⃣", label: "Nothing" }],
      answer: 0,
    },
  },
  "pricing-2": {
    title: "Set the price",
    cards: [
      { icon: "➕", text: "Price = cost + profit. Profit 30–50% is healthy." },
      { icon: "🏘️", text: "Check nearby shops. Stay in the same band, not the cheapest." },
      { icon: "⚖️", text: "Example: ₹35 cost → sell at ₹50–₹60." },
      { icon: "📉", text: "Too cheap scares buyers. Fair price builds trust." },
    ],
    task: { kind: "none", instruction: "Price your best product with the 30–50% rule." },
    quiz: {
      q: "Cost ₹40. Good price?",
      options: [{ icon: "📉", label: "₹35" }, { icon: "✅", label: "₹55" }, { icon: "🚀", label: "₹200" }],
      answer: 1,
    },
  },
  "pricing-3": {
    title: "Discounts that work",
    cards: [
      { icon: "🎁", text: "Combo: 2 jars for ₹280 instead of ₹300. Buyers love combos." },
      { icon: "🪔", text: "Festival offer for 7 days only. Urgency sells." },
      { icon: "🚫", text: "Never discount below cost. Free delivery only above ₹500." },
      { icon: "📣", text: "Announce offers once on WhatsApp broadcast." },
    ],
    task: { kind: "none", instruction: "Design one combo offer for your shop." },
    quiz: {
      q: "Safe discount rule?",
      options: [{ icon: "🚫", label: "Never below cost" }, { icon: "🎁", label: "Always 50% off" }, { icon: "🤫", label: "Hide prices" }],
      answer: 0,
    },
  },
  "packing-1": {
    title: "Pack like a pro",
    cards: [
      { icon: "🫙", text: "Food: airtight jars, wipe the rim, seal tight." },
      { icon: "🧵", text: "Clothes: fold, poly-bag, then paper bag." },
      { icon: "🏷️", text: "Every pack gets a label: name, weight, date." },
      { icon: "💧", text: "Pickle jars travel upright. Mark this side up." },
    ],
    task: { kind: "none", instruction: "Pack one product fully and check the label." },
    quiz: {
      q: "Every pack needs…",
      options: [{ icon: "🏷️", label: "Name + weight + date" }, { icon: "📰", label: "Newspaper only" }, { icon: "❌", label: "Nothing" }],
      answer: 0,
    },
  },
  "packing-2": {
    title: "Delivery options",
    cards: [
      { icon: "🚶", text: "Nearby buyers: self pickup is free and fastest." },
      { icon: "🛵", text: "Same village: family member or Sakhi can deliver." },
      { icon: "📮", text: "Far orders: post or courier. Add ₹30 delivery." },
      { icon: "📦", text: "Village pooling: Sakhi collects many orders together, cost shared." },
    ],
    task: { kind: "none", instruction: "Choose your default: pickup, self-delivery, or courier." },
    quiz: {
      q: "Cheapest for far orders?",
      options: [{ icon: "✈️", label: "Flight" }, { icon: "📦", label: "Pooled pickup" }, { icon: "🚶", label: "Walk 200km" }],
      answer: 1,
    },
  },
  "packing-3": {
    title: "Handle returns calmly",
    cards: [
      { icon: "📞", text: "Complaint first: listen fully, say sorry once, ask for a photo." },
      { icon: "🔄", text: "Broken or spoilt: replace or refund. One loss saves ten buyers." },
      { icon: "📓", text: "Note every complaint. Repeat complaints mean recipe/packing change." },
      { icon: "⭐", text: "Fixed well, angry buyers become your loudest fans." },
    ],
    task: { kind: "none", instruction: "Write your replacement promise in one line." },
    quiz: {
      q: "Jar arrived broken. You…",
      options: [{ icon: "🙈", label: "Ignore" }, { icon: "🔄", label: "Replace or refund" }, { icon: "😡", label: "Argue" }],
      answer: 1,
    },
  },
  "safety-1": {
    title: "Spot the fraud",
    cards: [
      { icon: "🎣", text: "Too-good orders (100 jars, advance needed) are usually traps." },
      { icon: "🔗", text: "Never tap unknown links. Real buyers use your shop link." },
      { icon: "💳", text: "Nobody needs your OTP, PIN, or CVV. Ever." },
      { icon: "🕵️", text: "Check: does the buyer answer normal questions? Frauds rush you." },
    ],
    task: { kind: "none", instruction: "Tell one family member the OTP rule today." },
    quiz: {
      q: "Buyer wants your OTP to pay you. It is…",
      options: [{ icon: "✅", label: "Normal" }, { icon: "🚨", label: "Fraud" }, { icon: "🤷", label: "Confusing" }],
      answer: 1,
    },
  },
  "safety-2": {
    title: "Safe phone habits",
    cards: [
      { icon: "🔒", text: "Phone lock + Ojasvini PIN: two doors on your shop." },
      { icon: "👋", text: "Log out on shared phones. It takes one tap in Profile." },
      { icon: "📸", text: "No face photos needed anywhere. Product photos only." },
      { icon: "🌙", text: "Auto-lock: the app locks itself when idle." },
    ],
    task: { kind: "none", instruction: "Turn on your phone lock today if it is off." },
    quiz: {
      q: "Shared family phone. You…",
      options: [{ icon: "🔓", label: "Stay logged in" }, { icon: "👋", label: "Log out after work" }, { icon: "📝", label: "Write PIN on cover" }],
      answer: 1,
    },
  },
  "safety-3": {
    title: "If something goes wrong",
    cards: [
      { icon: "📞", text: "Money fraud: call 1930 within hours. Speed matters." },
      { icon: "🧾", text: "Keep screenshots of chats and payments as proof." },
      { icon: "👩", text: "Tell your Sakhi. She has seen it before and will guide." },
      { icon: "💪", text: "Reporting protects the next woman too." },
    ],
    task: { kind: "none", instruction: "Save 1930 in your phone contacts now." },
    quiz: {
      q: "First step after suspected fraud?",
      options: [{ icon: "📞", label: "Call 1930 fast" }, { icon: "😴", label: "Wait a month" }, { icon: "🗑️", label: "Delete everything" }],
      answer: 0,
    },
  },
  "schemes-1": {
    title: "Schemes that help you",
    cards: [
      { icon: "🏛️", text: "Government schemes give loans, training, and subsidies to women." },
      { icon: "🎯", text: "Most need: woman applicant + small business + Aadhaar." },
      { icon: "📋", text: "Keep ready: Aadhaar, bank passbook, one photo, business proof." },
      { icon: "🔍", text: "Ojasvini Scheme Finder shows ONLY what you qualify for." },
    ],
    task: { kind: "none", instruction: "Gather your Aadhaar + passbook in one folder." },
    quiz: {
      q: "What do most schemes need first?",
      options: [{ icon: "🎓", label: "English degree" }, { icon: "📋", label: "Aadhaar + business proof" }, { icon: "🏙️", label: "City address" }],
      answer: 1,
    },
  },
  "schemes-2": {
    title: "MUDRA loans simply",
    cards: [
      { icon: "💰", text: "MUDRA gives small business loans up to ₹10 lakh, no security needed." },
      { icon: "🏦", text: "Apply at any bank with your Aadhaar and business details." },
      { icon: "📝", text: "Write 5 lines: what you sell, monthly cost, monthly earning." },
      { icon: "⏳", text: "Banks take weeks. Your Sakhi can follow up with you." },
    ],
    task: { kind: "none", instruction: "Write your 5-line business note in the notebook." },
    quiz: {
      q: "MUDRA loan needs…",
      options: [{ icon: "🏠", label: "Your house as guarantee" }, { icon: "📝", label: "Aadhaar + business details" }, { icon: "💎", label: "Gold" }],
      answer: 1,
    },
  },
  "schemes-3": {
    title: "Apply without fear",
    cards: [
      { icon: "🖥️", text: "Many applications are online. Sakhi or cyber-cafe can help." },
      { icon: "❌", text: "No officer can demand money for a free scheme. Report it." },
      { icon: "📬", text: "Rejection letters say why. Fix it and apply again." },
      { icon: "🤝", text: "Self-help groups (SHG) get priority in many schemes. Join one." },
    ],
    task: { kind: "none", instruction: "Ask your Sakhi which scheme fits you best." },
    quiz: {
      q: "Officer asks for money to approve your free scheme. You…",
      options: [{ icon: "💸", label: "Pay quietly" }, { icon: "🚫", label: "Refuse and report" }, { icon: "🏃", label: "Give up" }],
      answer: 1,
    },
  },
};
