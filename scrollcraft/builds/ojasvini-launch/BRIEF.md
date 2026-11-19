# BRIEF — ojasvini-launch (scroll-craft build #2)

Status: **Self-authored under explicit creative delegation.** The user directed the
palette, type scale, layout, deliverables and feel; creative authority on structure
was delegated ("scrap the current landing page and build something new from scratch
which should be very fitting for the theme but still out of the box"). Answers below
are verbatim user requirements where quoted, authored decisions where mine.

## The eight topics

1. **Vibe (3–5 words, references).** Minimal, confident, civic-modern. Reference by
   structure only: Apple product pages (edge-to-edge tiles, one interactive color,
   chrome that recedes — taken from `design-md/references/apple/DESIGN.md`; no
   brand in design-md matches this palette). Author decision.
2. **Scroll journey, section by section (user's requirements, verbatim).**
   "make sure it is the best, simple, and minimal website which serves its purpose
   to tell the visitor what its about… immediately communicate what the product
   does… keep the length of the landing page shorter and informative and visually
   creative… utilize the whole space of the website, dont leave so big spaces on
   the edges horizontally." Authored sequence: what it is (hero) → see it (film)
   → watch it work under your hand (app mockup) → how it works (3 steps) →
   what's inside (features) → one action (close).
3. **Energy curve.** Calm-clarity at the hero → excitement at the film → highest
   at the self-demo → settling through how/features → resolved at the close. Not
   loud throughout: two quiet sections carry the information.
4. **Feel per stage + the ONE moment.** Hero: "I know what this is." Film: "It's
   real." Self-demo: "I scrolled and it made a sale." How: "Three steps, I could
   do this." Features: "It does everything." Close: "I'll start." **Peak:** the
   scroll-driven mockup — the app performs a full sale (product listed → order
   lands → payout) under the reader's own scroll. It gets the largest span (a
   2.6-viewport pin) and the silence around it.
5. **One thing no site does.** The product demo is driven by the reader's scroll
   instead of a video: the cursor moves when you move, the sale completes when
   you finish scrolling. Signature move = **scroll-driven self-demo**.
6. **Distance from premium-minimal.** Premium-minimal, exactly. Palette and type
   are prescribed; zero decoration beyond hairlines, one accent (#FF6700) for
   action only.
7. **One world or distinct scenes?** One world: a single #EBEBEB ground for the
   whole page. Media (film, mockup) appears only as framed objects on that
   ground. No chapter plates, no dark cuts (that grammar is what we're scrapping).
8. **Assets already owned.** Product: the live Ojasvini app itself (mockup is
   custom-coded from its real UI). Film: produced by /brag this run (Hyperframes).
   Palette/type: user-specified. No photography available → no generated imagery
   needed; KIE key held in reserve, unvalidated.

## Hard requirements (user, verbatim)

- Palette whole-site: primary `#004E98`, secondary `#3A6EA5`, highlight/CTA
  `#FF6700`, light surface `#EBEBEB`, borders `#C0C0C0`. (Done in `styles/tokens.css`;
  `--madder/--accent` = `#b34700` for text-safe orange, `--cta` = exact `#FF6700`.)
- Type: H1 125px, H2 24px, H3 18px, H4 12px (landing surface tokens, enforced
  unlayered).
- Full-width: no big horizontal edge gaps.
- Scrolling: "very smooth and pleasant and exciting."
- Deliverables: custom-coded app mockup (stageshow), product video (@brag)
  embedded where it fits most, design-md as reference.

## Journey (beats)

1. Recognition — the name and the mechanic at 125px: what this is, instantly.
2. Proof — the product film: it exists, it moves, it's real.
3. Agency — the self-demo: scrolling performs a sale (PEAK).
4. Comprehension — three steps: speak, snap, sell.
5. Range — six things it does, hairline grid, edge-to-edge.
6. Commitment — one line, one orange button.

## Feeling curve (one line per act)

| # | Act | Feeling | What on screen causes it |
|---|---|---|---|
| 1 | Hero | clarity | "Speak. Snap. Sell." edge-to-edge at 125px, one sub-line, orange CTA |
| 2 | Film | excitement | the product film fills the width, plays itself on entry |
| 3 | Self-demo | delight / agency (PEAK) | pinned phone; the cursor performs the flow as you scroll |
| 4 | How | understanding | three numbered steps arrive one by one on hairlines |
| 5 | Features | confidence | six tiles, one accent, quiet density |
| 6 | Close | resolve | one sentence, one orange button, nothing after it |

## Peak

"It's the site where scrolling sells the product for you — the app lists a
product and lands an order under your own hand." Lives in act 3 (self-demo),
largest span on the page (2.6 pinned viewport-heights vs flow sections).

## Grammar and why the other seven lost

Chosen: **launch sheet** (new grammar: one light ground, type-led, media only as
framed objects, hairline structure, no plates, quiet close).

| Grammar | Why it lost |
|---|---|
| 2.1 Filmic one-shot | Wants a film-led, showy continuous page; user asked simple/minimal/short |
| 2.2 Chaptered editorial | This is the build being scrapped ("scrap the current landing page") |
| 2.3 Live surface | Dashboard-as-landing duplicates the app the rest of the site already shows |
| 2.4 Continuous world | Needs generated footage for one flight; no owned footage, spend unvalidated |
| 2.5 Typographic poster | Bans media — user mandates a video and an app mockup on the page |
| 2.6 Gallery/catalog | A catalog of shots tells a feature story, not "what this is" in one screen |
| 2.7 Split stage | Two-column split fights the full-width, no-edge-gaps requirement |
| 2.8 Rhythmic cutlist | Hard-cut rhythm fights "smooth and pleasant" scrolling |

## Score table (device per beat)

| Beat | Device | Why this one |
|---|---|---|
| Recognition | `kinetic` (words) + flow reveal | The mechanic assembling word by word; static-readable at rest |
| Proof | `reveal` (wipe) + in-view video | A wipe is "here it is"; video carries motion so type stays still |
| Agency | `pin` + custom `--sc-p` state machine | The page must hold still while the reader performs the sale |
| Comprehension | `stagger` (in, once) | Three steps arriving in order is the argument |
| Range | `stagger` on hairline grid | Grid arrives as one quiet wave, no second pinned moment |
| Commitment | none (static) | The page stops moving when it asks |

Checks: 4 device families (kinetic/reveal/pin/stagger) ✓ · no family twice in a
row ✓ · scrub acts 0 ✓ (video autoplays, not scrubbed — keeps the page light) ·
adjacent feelings differ ✓ · peak largest span ✓ · act count 6, total ~11
viewport-heights (outside the 6–7 @ 13.6–13.8vh band) ✓ · grammar bans (no
plates, no chapter numbers, no scroll cues, no counters) ✓.

## Fingerprint gate vs row `ojasvini-landing`

| Dimension | Row 1 | This build | Differs |
|---|---|---|---|
| Grammar | Editorial: 8 chapter bands, plates, hard cuts | Launch sheet: one ground, type-led, hairlines | ✓ |
| Nav treatment | Top header + left-margin folio | Minimal top bar (wordmark + CTA), no folio | ✓ |
| Hero device | Type-only title page, time-based letter assembly | Edge-to-edge 125px kinetic words, film in 2nd screen | ✓ |
| Act-sequence | 6 flow + 170vh count peak, pin 0, scrub 0 | 5 flow + one 2.6vh pin self-demo, scrub 0 | ✓ |
| Close pattern | Running-text inline underlined link | Orange button band + quiet footer | ✓ |
| Signature move | Margin folio writes chapter initials | Scroll-driven self-demo performs a sale | ✓ |

**6/6 clear** (needs 4/6).

## i18n

Reuse existing `landing.*` keys (speak/snap/sell, steps, features, trust, start,
faq, footer). New keys, ×8 locales: `heroSub`, `filmTitle`, `filmDesc`,
`demoTitle`, `demoDesc`, `closeLine`.

## Authored silence

None planned: every section carries content. The self-demo's pinned travel is
intentional dwell (the sale completes inside the pin), not dead scroll.
