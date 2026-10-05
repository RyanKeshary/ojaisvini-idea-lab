# OJASVINI (ओजस्विनी) / SAKHI

> **"SPEAK. SNAP. SELL."**  
> *The only digital business platform where a rural woman who cannot read or type goes from a spoken sentence and one photo to a live, shareable, payment-ready online storefront in under 2 minutes, in her own language, even with poor connectivity.*

**Theme:** Tech4Startup — SDG 4 (Quality Education) + SDG 9 (Industry, Innovation & Infrastructure)  
**Problem Statement 6 Focus:** Overcoming access barriers for rural women entrepreneurs in Maharashtra & India.

---

## 🌟 Core Philosophy

> *"Don't force the woman to learn technology. Make the technology adapt to her."*

Ojasvini is designed for low-literacy women operating on low-end or shared smartphones with intermittent 2G/3G connectivity. Instead of complex forms, typing, or English-first dashboards, Ojasvini provides:
- **Audio-first & visual-first interactions:** Every key screen, button, and prompt can be spoken aloud (`🔊 Listen`).
- **No-typing listing loop:** Speak product description -> snap photo -> Groq multimodal AI drafts the listing -> audio review -> confirm by voice ("haan" / "₹150") -> published!
- **End-to-end commerce & empowerment:** Integrates learning, selling, community, scheme discovery, and mentored support in a single, offline-capable PWA.

---

## 📊 Problem Statement Coverage Matrix

| Code | Problem Statement Challenge | Ojasvini Solution |
| :--- | :--- | :--- |
| **PS1** | Information gap on government schemes | **Scheme Finder:** Deterministic eligibility engine + AI plain-language explainer (`26 verified schemes`) |
| **PS2** | Prohibitive last-mile delivery costs | **Delivery Pooling:** Pincode/village batch pickup grouping with pooled cost savings tracker |
| **PS3** | Poor showcase, branding, and quality perception | **Instant Storefronts:** Dynamic OG social cards, printable QR posters, client-side photo coach |
| **PS4** | Lack of data-driven pricing & business support | **Price Guidance & Insights:** Village-market price bands + AI weekly business advice |
| **PS5** | Absence of local-language digital content | **Vernacular First:** Full Hindi, Marathi, Gujarati, Tamil, English support with audio narration |
| **PS6** | **Core Access Barriers for Women (Detailed below)** | **Voice-first, private-mode PIN lock, bite-size micro-learning, peer community** |
| **PS7** | Patchy network, low-end devices, battery drain | **Offline-First PWA:** Service worker caching, IndexedDB outbox, low-data mode, client image compression |
| **PS8** | Fragmented tools (selling vs learning vs finance) | **Unified Ecosystem:** Listing + storefront + demo payments + orders + schemes + community |
| **PS9** | Fear and lack of fintech & credit awareness | **Safe Simulators:** Zero-risk dummy UPI & WhatsApp simulator, demo payment gateway |
| **PS10**| Isolation and absence of female mentors | **Community & Sakhi Network:** Women-only forum + field-volunteer assisted onboarding & check-ins |

### Addressing the Six Core PS6 Barriers
1. **Limited Mobility:** Women learn at home in 2-3 minute audio-visual lessons at their convenience.
2. **Financial Dependence:** Zero registration cost, immediate path to first income, direct payouts to their UPI.
3. **Shared Devices:** Quick PIN lock, privacy mode to hide sensitive financial screens, fast logout without leaving history.
4. **Language Barriers:** Complete multi-vernacular UI (Marathi, Hindi, Gujarati, Tamil, English) with speech output.
5. **No Tailored Training:** Micro-learning organized by trade (food, crafts, tailoring, dairy) with hands-on practice.
6. **Social Isolation:** Women-only forum with audio questions, reactions, and direct support from village Sakhi mentors.

---

## 🏗️ System Architecture

```
                                  +------------------------------------+
                                  |     Browser / PWA (Client)         |
                                  |  - Voice Orb & Web Speech API      |
                                  |  - Service Worker + IDB Outbox     |
                                  |  - Zustand Client Prefs & State    |
                                  +-----------------+------------------+
                                                    |
                                            HTTPS / SSR / SSE
                                                    v
+-------------------------------------------------------------------------------------------------------+
|                                    Next.js 15 App Router (Server)                                     |
|                                                                                                       |
|  [ Public Routes ]           [ Protected Seller App ]          [ Consoles & Management ]              |
|  - / (Landing Hero)          - /app/home, /create              - /sakhi-console (Field Volunteer)     |
|  - /shop/[slug] (Storefront) - /app/products, /orders          - /admin (Metrics, Flags, Moderation)  |
|  - /gallery (UI Kit Demo)    - /app/learn, /schemes, /community                                       |
|                                                                                                       |
|  ---------------------------------------------------------------------------------------------------  |
|  [ API Layer (Zod-Validated, Rate-Limited, In-Memory Token Bucket) ]                                   |
|  - /api/listing/generate · /api/ai/intent · /api/stt · /api/assistant · /api/insights                 |
|  - /api/pay/* (Demo Gateway) · /api/orders/* · /api/schemes/* · /api/community/* · /api/auth/*         |
|                                                                                                       |
|  ---------------------------------------------------------------------------------------------------  |
|  [ Service & Domain Layer ]                                                                           |
|  - Listing · Orders & Pooling · Payment State Machine · Eligibility Engine · Learn Catalog            |
|                                                                                                       |
|  ---------------------------------------------------------------------------------------------------  |
|  [ Adapters (Real with Graceful Deterministic Fallback) ]                                              |
|  - AI: Groq (Llama 3.3, Llama 4 Vision, Whisper Turbo) <---> Deterministic Mock Provider             |
|  - Payments: Demo Gateway (UPI / Card / Netbanking / COD) <---> Idempotent HMAC Signatures            |
|  - Storage: Local Disk (/public/uploads) <---> Cloud S3/R2 Ready                                      |
+---------------------------------------------------+---------------------------------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      |     Prisma ORM (SQLite)   |
                                      |   PostgreSQL-Ready Schema |
                                      +---------------------------+
```

---

## 🚀 Quickstart & Setup

### 1. Requirements
- Node.js 18+ (tested on Node.js 20 & 24)
- npm or pnpm

### 2. Installation
```bash
# Clone and enter the repository
cd "Idea lab - rural women empowerment"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Key configuration parameters:
- `AI_PROVIDER=mock`: Deterministic fixtures running offline without API keys (default).
- `AI_PROVIDER=groq`: Enables live Groq AI. Set `GROQ_API_KEY=<your-groq-key>` in `.env.local`.
- `GROQ_MODEL_CHAT=llama-3.3-70b-versatile`
- `GROQ_MODEL_VISION=meta-llama/llama-4-scout-17b-16e-instruct`
- `GROQ_MODEL_STT=whisper-large-v3-turbo`
- `DATABASE_URL="file:./dev.db"`

### 4. Database Seed
Run the unified master seed script to populate staff accounts, demo sellers, products, realistic orders, schemes, lessons, and forum posts:
```bash
npm run seed
```

### 5. Start Development or Production Server
```bash
# Development server (http://localhost:3000)
npm run dev

# OR Production build and run
npm run build
npm start
```

---

## 🔑 Demo Credentials & Test Data

All environments support offline/demo verification without live SMS or payments.

### 1. Seller & User Logins (`/auth/login`)
- **Demo Phone Numbers:**
  - Marathi Seller: `9820000001` (Sunita Tai — Shop: `/shop/sunita-swad`)
  - Hindi Seller: `9820000002` (Radha Devi — Shop: `/shop/radha-creations`)
  - Gujarati Seller: `9820000003` (Bhavna Ben — Shop: `/shop/bhavna-gruh-udhyog`)
  - Tamil Seller: `9820000004` (Meenakshi Ammal — Shop: `/shop/meenakshi-handlooms`)
  - Any random 10-digit number (auto-creates a new seller)
- **Universal Demo OTP:** `123456`
- **Universal Demo PIN:** `1234`

### 2. Staff & Field Volunteers (`/auth/staff`)
- **Field Sakhi Volunteer:** `sakhi@ojas.demo` / Password: `demo1234` (Accesses `/sakhi-console`)
- **System Administrator:** `admin@ojas.demo` / Password: `demo1234` (Accesses `/admin`)

### 3. Demo Payment Gateway (`/shop/[slug]/pay/[orderId]`)
- **UPI:** Any format (e.g. `buyer@okhdfcbank`), simulates real-time app approval with live countdown.
- **Card Numbers (Luhn Validated):**
  - `4111 1111 1111 1111` -> **SUCCESS** (Prompts OTP: `123456`)
  - `4000 0000 0000 0002` -> **DECLINED** (Simulates bank refusal with retry UX)
  - `4000 0000 0000 9995` -> **INSUFFICIENT FUNDS**
- **Netbanking:** Pick any major bank -> simulated approval/rejection toggle.
- **Cash on Delivery (COD):** One-tap instant placement.

---

## 🎯 Verification & Quality Gates

The codebase enforces strict quality controls. Run the following test commands:

```bash
# 1. Typecheck (Zero TypeScript errors)
npm run typecheck

# 2. Unit Tests (Vitest: i18n parity, number parser, commands, eligibility, payments, schemas)
npm run test

# 3. Production Build
npm run build

# 4. Core MVP E2E Test (Speak -> Snap -> AI Draft -> Publish -> Storefront)
npm run e2e

# 5. Full E2E Test Suite (MVP, Commerce, Learning, Schemes, Assistant, Community, Consoles, Offline)
npm run e2e:all

# 6. Deep Audits (Dead Links and Responsive Viewport Overflows)
npm run audit:links
npm run audit:overflow
```

---

## 🎬 3-Minute Demo Script for Presentation

Follow this exact flow during judging or live demonstration:

1. **Language Choice (0:00 - 0:25)**
   - Open the homepage (`/`).
   - Tap the language tile **"मराठी"** or **"हिंदी"**. Notice how the tile speaks its name aloud upon touch with zero page reload.
2. **Voice Onboarding & PIN (0:25 - 0:50)**
   - Click "विक्री सुरू करा" (Start Selling).
   - Enter demo phone (`9820000001`), enter OTP `123456`.
   - Set 4-digit PIN (`1234`) using the large, high-contrast numeric keypad.
3. **The Core Loop: Speak -> Snap -> Sell (0:50 - 1:30)**
   - Tap the central pulsing **Voice Orb**.
   - Speak or select: *"मी आंब्याचं लोणचं बनवते"* (I make mango pickle).
   - Snap/upload product photo.
   - Watch the AI magic shimmer. The vision AI drafts title, category, village price band (₹120–₹160), and speaks it aloud.
   - Adjust price to ₹150 with the slider.
   - Click **"दुकान सुरू करा" (Publish)** -> Confetti burst + immediate QR poster generation + WhatsApp share link!
4. **Buyer Checkout Flow (1:30 - 2:05)**
   - Open the storefront link on another window/phone (`/shop/sunita-swad`).
   - Add product to cart -> Proceed to Demo Checkout.
   - Choose Demo UPI -> Enter `buyer@okhdfcbank` -> Success animation!
5. **Order Processing & Payout (2:05 - 2:25)**
   - Return to Seller dashboard (`/app/orders`).
   - See the incoming order card -> Tap **"स्वीकारा" (Accept)**.
   - Navigate to `/app/payouts` -> See ₹176 net earnings updated -> Tap "पैसे खात्यात पाठवा" (Withdraw to UPI).
6. **Government Schemes & AI Assistant (2:25 - 2:45)**
   - Navigate to `/app/schemes` -> Click **"माझ्यासाठी योजना शोधा" (Match Me)**.
   - Answer 3 pictorial questions -> Instant filtered list (PM Mudra Yojana, PMFME).
   - Click **"सोप्या भाषेत सांगा" (Explain Simply)** to hear a Grade-4 explanation in Marathi.
7. **Offline Capability & Closing (2:45 - 3:00)**
   - Simulate offline (turn off network) -> Add a draft in `/app/create` -> App notifies *"Offline — saved locally"*.
   - Reconnect network -> Automatic background sync!
   - Conclude with the core mantra:  
     **"Don't force the woman to learn technology. Make the technology adapt to her."**

---

## 📜 License
Developed for Tech4Startup — SDG 4 & SDG 9 Innovation Hackathon. Open source for rural social impact under the Apache-2.0 License.
