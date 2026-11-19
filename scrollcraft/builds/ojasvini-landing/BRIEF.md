# BRIEF — Ojasvini landing, chaptered rebuild

Interviewed pass. Four topics answered by the user in this session (verbatim
below); the rest authored under the answers given, marked as such.

## The eight topics

1. **Vibe (user, verbatim):** "Warm, printed, proud" — references: Indian
   block-print textiles, mid-century Marg magazine spreads, Amul billboard wit.
   → Aesthetic family: **editorial** (paper, folios, measure, restraint).
2. **Scroll journey (user, verbatim):** "Lead with a seller's morning" — open on
   one woman's real morning (story chapter), then the product, then proof, then
   close. The existing section order for everything after the opening:
   hero → stats → 3-step how-it-works → features → comparison → field impact →
   FAQ → close (user: "Keep this order as chapters" was offered; the chosen
   answer reorders the OPENING only, so the rest keeps its order).
   *Authored detail:* morning and the problem stats merge into one chapter —
   the stats ARE her morning's cost, and it keeps every string in its existing
   8 locales (no new copy invented).
3. **Energy curve (authored from answers 1–2):** calm title page → intimate
   morning → unease (the cost) → relief (3 steps) → confidence (features) →
   trust (comparison) → quiet (FAQ) → **pride (PEAK)** → resolve (close).
4. **Feeling + peak (user, verbatim):** "Quiet open, building proof, PEAK at
   the field-experience/SDG chapter with real numbers counting up, calm close."
   → Peak = field experience & impact chapter, largest scroll room.
5. **One thing no site does (user, verbatim):** "Margin folio writes itself in
   your language" — chapter initials draw stroke-by-stroke in the reader's own
   script as each chapter enters, stacked in the margin as clickable chapter
   navigation. → the signature move.
6. **Range (authored):** editorial, per answer 1. Not brutalist, not
   premium-minimal.
7. **Structure (user, earlier session):** distinct chapters — separate scenes
   with clear cuts, not one continuous world. Hard-cut grounds per chapter, no
   drift interpolation.
8. **Assets (user, verbatim):** "I'll provide a KIE key" — key not yet
   supplied. First build runs on assets the repo already owns: real product
   photography in `public/uploads/`, the SuperWomanPixel artisan art, the
   OjasDidi mascot. KIE generation slots in later for the peak media.

## Feeling curve (one line per act; written before the acts)

| # | Act | Emotion | What on screen causes it |
|---|---|---|---|
| 0 | Title page | calm recognition | her name at 125px on mint paper, type only, no media |
| 1 | Her morning | intimacy → unease | one woman's morning in her words; three field numbers tick up, the zero lands last |
| 2 | Speak. Snap. Sell. | relief | the three steps wipe in, one after another |
| 3 | Everything in one place | confidence | six capabilities arrive in reading order |
| 4 | Why Ojasvini is different | trust | the comparison table wipes in row by row |
| 5 | FAQ | calm | objections answered in small type, no drama |
| 6 | Field experience & impact | **pride (PEAK)** | ground cuts to deep indigo, iris opens on the impact line, SDG 4/8/9 count up |
| 7 | Close | resolve | masthead plate, CTA as a line of running text, holds |

Adjacent acts never share a feeling; act 5 (quiet) is deliberately quieter than
the peak that follows it.

## The peak

**Act 6, field experience & impact.** Largest span on the page (min-height
~170vh against ~100–130vh neighbours), the only hard cut to a deep ground, the
page's single `iris`, and the SDG numerals counting up.

The sentence a visitor says to a friend:
> "The whole page is mint and quiet and then it drops into this deep blue
> chapter where the impact numbers count up — that's the part I remembered."

## Tell-someone sentence

> "It's the site where the chapter numbers write themselves in your own
> language down the side of the page, and a rural seller's morning is told
> like a printed story."

## Authored silence

- Act 5 (FAQ) is the silence before the peak: small type, no counters, no
  reveal beyond the entry stagger. Verification must read it as intentional
  quiet, not dead scroll.
- Between the peak's staged reveal groups (~170vh) there are deliberate gaps
  where only the ground and the folio are visible; content re-arrives each
  time the reader advances. Not filler.

## Score table (device per beat)

| Beat | Act | Device family | Why this one |
|---|---|---|---|
| Recognition | 0 Title | `kinetic` | title page is type; the H1 assembling is the only motion it needs |
| Tension | 1 Morning | `count` + `parallax` (media column) | real field figures ticking is the cost named plainly; photo planes move at different rates |
| Turn | 2 Steps | `reveal` | a wipe is a change of state — speaking becomes listing becomes selling |
| Substance | 3 Features | `flow` + `in` | dense spread, six items in reading order |
| Proof | 4 Compare | `reveal` (rows) | rows wiping in reads as evidence accumulating |
| Silence | 5 FAQ | `flow` + `in` | quiet on purpose, before the peak |
| **Peak** | 6 Impact | `count` + `iris` + `kinetic` | numbers land, the loudest reveal once, the impact line assembles |
| Commitment | 7 Close | `flow` + `in` | resolves and holds; CTA as running text |

Device families: kinetic, count, parallax, reveal, flow+in = **5** (≥4 ✓).
No family twice in a row ✓. Scrub acts: **0** (≤2 ✓). Grammar bans hold: no
drift (grounds painted per section), no full-bleed scrub hero, no pinned
crossfade, no magnet, no centred hero copy, no spotlight ✓.

## Engine integration notes (facts found while reading the engine)

- `window.ScrollCraft.mount(root)` / `api.destroy()`; registers window
  listeners + 2 rAF loops — destroy on unmount is mandatory (Next router).
- `[data-sc-in]` children start at `opacity: 0` in engine CSS → a
  `<noscript>` style must force them visible, or no-JS readers get a blank page.
- Engine reads `prefers-reduced-motion` at load, NOT the app's
  `data-motion="reduced"` → page CSS mirrors the engine's reduced block keyed
  on `[data-motion="reduced"]`.
- `data-sc-count` outside a `data-sc-act` fires once on entry; inside a flow
  act it is progress-driven — check before placing.
- Parallax needs an act ancestor for progress.
