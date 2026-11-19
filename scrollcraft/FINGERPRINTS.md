# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `ojasvini-landing` | Editorial: 8 chapter bands, hard cuts, intertitle plates, 0 pinned acts | Static top header + left-margin folio (write-on chapter chips, ≥1280px) | Type-only title page, time-based letter assembly (no media above fold) | 6 flow acts + entry counts → one 170vh count+iris+kinetic peak → flow close; scrub 0, pin 0 | Running-text CTA (display sentence, inline underlined link) | Margin folio writes its chapter initials in the reader's language (grapheme per chapter) | Warm printed: mint paper ground, clay plates, single indigo peak cut, saffron figures | localhost:3000 (Next.js App Router) |

*(first row: nothing to clear. From the second onwards this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

Nothing is taken yet.

- **Editorial chaptered-band grammar**: 8 bands, intertitle plates, hard cuts,
  zero pinned acts — `ojasvini-landing`.
- **Margin folio nav treatment**: write-on chapter-initial chips in the left
  margin (≥1280px) — `ojasvini-landing`.
- **Type-only title page**: the name assembles on time, not on scroll —
  `ojasvini-landing`.
- **Running-text close CTA**: display sentence with an inline underlined link —
  `ojasvini-landing`.
- **Single-peak act band**: one ~170vh count+iris+kinetic peak with authored
  bottom silence — `ojasvini-landing`.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
