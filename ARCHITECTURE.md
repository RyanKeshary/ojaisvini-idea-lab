# Ojasvini — Architecture

Voice-first, multilingual PWA for rural women entrepreneurs.
Mantra: "Don't force the woman to learn technology. Make the technology adapt to her."
USP (say everywhere): **"SPEAK. SNAP. SELL."**

## Status

- Phase 1 — design system + 30-component UI kit, i18n (hi/mr/en), gallery. Visually verified.
- Phase 2 — Auth.js phone OTP/PIN/staff, single-use login tickets, lockout, middleware guards.
- Phase 3 — Speak→Snap→AI listing→publish→public storefront + OG. E2E green (~8s).
- Phase 0 (this doc) — Groq/Mock AI provider, usage log, baselines. No UI change.
- Phase 1 — intent API (rule-first + Groq fallback), Whisper STT fallback route,
  AiCache for drafts, per-user/IP AI rate limits, 1024px/q0.7 photos. Live-verified.
- Phase 2 — demo gateway (UPI poll/card OTP/netbanking/COD), cart+checkout,
  order lifecycle + tracking, refunds, payouts + demo settlement, village
  pooling batches. E2E commerce 5.7s; MVP e2e unchanged.
- Phase 3 — learning hub: 24 lessons (hi/mr/en) across 8 journeys, fake UPI /
  WhatsApp / photo simulators, picture quizzes, badges, recommender.
  E2E learn 2.9s; all suites green.
- Phase 4 — scheme finder: 26 real schemes, deterministic eligibility engine,
  match-me wizard, cached AI plain-language explainers, checklists, save/share.
  E2E schemes 4.4s; all suites green.
- Phase 5 — Sakhi Didi chatbot (streamed SSE, grounded, actions, feedback,
  thread memory) + insights API + home insights card + floating entry.
  E2E assistant 2.7s; all suites green.
- Phase 6 — community forum (rooms, voice/text/photo/audio posts, replies,
  thanks, best answers, reports + auto-hide, translate/summarize, moderation
  screen). E2E community 8s; all suites green.
- Phase 7 — Sakhi console (mentees + stuck points, assisted onboarding,
  check-ins) + Admin console (metrics, users, products, reports, AI usage,
  flags, schemes API). E2E consoles 2.1s; all suites green.
- Phase 8 — offline PWA (hand-rolled SW, IDB outbox + drafts, auto-sync,
  install card, low-data mode), notifications inbox, route skeletons.
  E2E offline 6.4s; all suites green. Web Push deferred (needs VAPID infra).
- Phase 9 — landing rewrite (10 sections, hi/mr/en, JSON-LD, sitemap/robots),
  auth split layouts, route transition templates. All E2E green.
- Phase 10 — master seed (multilingual demo sellers, 32 products, 24 orders, 26 schemes,
  40+ forum posts), link audit zero 404s, zero responsive overflow, full 8-suite
  E2E pass, comprehensive README with demo credentials, PS matrix & 3-min script.

## Runtime map

```
Browser (PWA, mobile-first)
  Next.js App Router (SSR dynamic; cookies carry locale/theme/motion prefs)
    Route Handlers (Zod in, JSON out, rate-limited)   Server Actions (mutations)
    Service layer: lib/{ai,shop,products,auth,sms,photos}
    Adapters: AI (groq|mock) · SMS (demo inbox) · Storage (local disk → S3-ready)
    Prisma → SQLite dev (Postgres-ready schema)
```

## Key flows

**Auth (ticket pattern).** Verify APIs (`/api/auth/otp|pin|staff/verify`) do all
checking with exact error codes → mint single-use `AuthTicket` (10 min) → Auth.js
Credentials provider only redeems the ticket. One code path, precise voiced
errors, no double verification. JWT carries `uid/phone/role`. Middleware guards
`/app/*`, `/sakhi-console`, `/admin` (+ role checks).

**Create → publish.** Client compresses to ≤1600px JPEG via canvas (strips EXIF/GPS)
→ `POST /api/upload` (type/size/magic-byte checks, `public/uploads/`) →
`POST /api/listing/generate` (vision → strict Zod JSON, retry once, mock fallback)
→ review by voice (rule-based hi/mr command parser + Indic number words) →
`POST /api/products` (ensures Shop, creates LIVE product, `revalidateTag`) →
share sheet (WhatsApp deep link, copy, QR via `qrcode`, live preview).

**Storefront (public, SSR).** `/shop/[slug]` + `/p/[id]` with `generateMetadata`,
dynamic OG at `/api/og/[slug]` (edge runtime; font subset fetched per glyph-set;
stats via internal `/api/shops/[slug]/stats` because Prisma can't run on edge).
Checkout is WhatsApp deep link until Phase 2 (payments) of the new plan.

**i18n.** `next-intl`, cookie locale (`ojas_locale`), `xx → hi → en` fallback,
per-script font stacks via `[data-locale]` (Fraunces + Tiro Devanagari + Mukta +
Noto per script). Server layout reads pref cookies so first paint matches
(no hydration mismatch). Scaffolded: gu/ta/te/kn/bn messages.

## AI provider (lib/ai)

`AIProvider { vision(), chat(), transcribe() }` — `GroqProvider` (groq-sdk,
server-side only) vs `MockProvider` (deterministic fixtures; methods throw by
design, callers use fixtures). `AI_PROVIDER=groq|mock` (default mock; groq also
needs `GROQ_API_KEY`). Any Groq error/timeout/rate-limit auto-falls-back to mock
with `degraded: true`. Every call logs to `AiUsageLog` (feature/model/tokens/
latency, no PII/prompts) fire-and-forget. `AiCache` (key/kind/value/expiry) is
wired in Phase 1 for drafts/explanations. Banned-claim stripper post-processes
every listing. Model IDs are env (`GROQ_MODEL_*`) — verify against
console.groq.com/docs/models; never hardcode, never ship the key to the client.

## Validation / security posture

Zod on every API boundary; bcrypt PIN/password; OTP SHA-256 + 5-min TTL +
5 attempts; per-phone + per-IP rate limits (in-memory, Upstash later); magic-byte
upload checks; audit log on auth/product/pin events; PII minimal (masked phones);
EXIF stripped client-side. `.env.local` holds secrets (gitignored).

## Verification (must stay green)

- `npm run typecheck` · `npm run test` (Vitest, 12 tests) · `npm run build`
- `node scripts/e2e-mvp.cjs [base]` — full Hindi MVP flow, <90s budget
- `npm run shot -- <url> <out> <w> <h> <locale> <theme> <full|reduced>` —
  deterministic screenshots (seeds prefs incl. cookies); zero console errors

## Known quirks (environmental, not app bugs)

- Sandbox headless Chrome never attaches cookies to requests: E2E shuttles a
  manual jar; app paths unchanged (proven in real browsers in Phase 2).
- `next start` snapshots `public/` at boot: runtime uploads 404 until restart
  (dev + object storage unaffected).
- next/og *node* build mis-joins its font path on Windows: OG route runs on edge.
- Puppeteer fullPage screenshots misplace fixed elements (stitch artifact);
  harness also captures a bottom-anchored viewport shot.

## Deferred (tracked, with owner phase)

- Locale route-segment + ISR for storefront SEO (before public-shop scale).
- Playwright migration for E2E (current: puppeteer-core + system Chrome).
- Object storage, real SMS/OTP, Upstash rate limits (prod hardening).
- gu/ta full translations; stand-up of remaining locales.
