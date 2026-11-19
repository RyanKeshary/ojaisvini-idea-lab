"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Phone, Row, Badge, Button, Field } from "@/components/stageshow/kit";
import { Cursor, ripple, type CursorKind } from "@/components/stageshow/kit/cursor";
import { rectOf } from "@/components/stageshow/kit/measure";
import { ArrowLeft, Camera, Check, Flame, Leaf, Share2, Wallet, Wheat } from "lucide-react";

/**
 * The signature move: a product listing that performs itself under the
 * reader's scroll. The section it lives in is a scroll-craft `pin` act; this
 * component reads that act's `--sc-p` on one rAF loop (rect fallback when the
 * engine is absent) and derives one snapshot from it — screen, typed text,
 * inserted row, landed order, where the cursor is heading and whether it is
 * pressing. Everything is a pure function of p, so scrolling back un-does the
 * sale instead of leaving it behind.
 *
 * SSR, reduced motion and no-JS all render the final beat (the sale landed):
 * the payoff is the default, motion only rewinds to it.
 */

const WORD = "Aam ka achar";

type Aim = "rest" | "new" | "field" | "publish";

type Snap = {
  screen: "home" | "form";
  inserted: boolean;
  order: boolean;
  chars: number;
  aim: Aim;
  press: null | "new" | "publish";
  kind: CursorKind;
  beat: 0 | 1 | 2;
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Beat thresholds, as fractions of the pinned act's travel. */
function derive(raw: number): Snap {
  const p = clamp01(raw);
  const screen: Snap["screen"] = p >= 0.31 && p < 0.62 ? "form" : "home";
  const chars =
    p <= 0.335 ? 0 : p >= 0.515 ? WORD.length : Math.round(((p - 0.335) / 0.18) * WORD.length);
  let aim: Aim = "rest";
  if (p < 0.31) aim = p < 0.235 ? "rest" : "new";
  else if (screen === "form") aim = p < 0.545 ? "field" : "publish";
  let press: Snap["press"] = null;
  if (p >= 0.255 && p < 0.305) press = "new";
  else if (p >= 0.565 && p < 0.612) press = "publish";
  return {
    screen,
    inserted: p >= 0.62,
    order: p >= 0.755,
    chars,
    aim,
    press,
    kind: aim === "field" ? "ibeam" : "pointer",
    beat: p >= 0.755 ? 2 : p >= 0.62 ? 1 : 0,
  };
}

const FINAL = derive(1);
const keyOf = (s: Snap) =>
  `${s.screen}|${s.inserted}|${s.order}|${s.chars}|${s.aim}|${s.press ?? ""}|${s.kind}|${s.beat}`;

type Design = {
  wide: boolean;
  dw: number;
  dh: number;
  px: number;
  py: number;
  pw: number;
  rest: { x: number; y: number };
};

/** Two designs, not one shrunk: the wide one carries a satellite receipt
 *  beside the phone; the compact one is the phone, whole, a little larger. */
const WIDE: Design = { wide: true, dw: 680, dh: 660, px: 46, py: 24, pw: 360, rest: { x: 630, y: 622 } };
const COMPACT: Design = { wide: false, dw: 400, dh: 660, px: 25, py: 24, pw: 350, rest: { x: 300, y: 560 } };

export function SelfDemo({
  title,
  desc,
  beats,
}: {
  title: string;
  desc: string;
  beats: [string, string, string];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pressedRef = useRef<HTMLElement | null>(null);

  const [design, setDesign] = useState<Design>(WIDE);
  const [scale, setScale] = useState(1);
  const designState = useRef({ design: WIDE, scale: 1 });
  designState.current = { design, scale };

  const [snap, setSnap] = useState<Snap>(FINAL);
  const snapRef = useRef(snap);
  snapRef.current = snap;

  const posRef = useRef({ ...WIDE.rest });
  const pressRef = useRef<Snap["press"]>(null);

  const readP = () => {
    const act = rootRef.current?.closest<HTMLElement>("[data-sc-act]");
    if (!act) return 1;
    const published = parseFloat(act.style.getPropertyValue("--sc-p"));
    if (isFinite(published)) return published;
    const r = act.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    return travel > 0 ? -r.top / travel : 0;
  };

  const aimAt = (aim: Aim) => {
    const root = designRef.current;
    if (!root) return null;
    if (aim === "rest") return designState.current.design.rest;
    const el = root.querySelector<HTMLElement>(`[data-target="${aim}"]`);
    if (!el) return null;
    const r = rectOf(root, el, 1);
    // The glyph's hotspot is its tip: a button aims at its middle, the field
    // just past the text it is typing
    const at = aim === "field" ? { x: 0.34, y: 0.5 } : { x: 0.5, y: 0.52 };
    return { x: r.x + r.width * at.x, y: r.y + r.height * at.y };
  };

  const place = (at: { x: number; y: number }) => {
    posRef.current = { ...at };
    if (cursorRef.current) cursorRef.current.style.transform = `translate(${at.x}px, ${at.y}px)`;
  };

  // Fit: pick the design for the well's width, then scale it to fit both axes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return;
      const d = w >= 560 ? WIDE : COMPACT;
      const s = Math.max(0.4, Math.min(1.6, Math.min(w / d.dw, h / d.dh)));
      const cur = designState.current;
      if (cur.design === d && Math.abs(cur.scale - s) < 0.004) return;
      setDesign(d);
      setScale(s);
      // A resize re-frames the shot: send the cursor home rather than leave it
      // stranded where the old design put it
      place(d.rest);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Before paint: hand the snapshot to the scroll position (SSR rendered the
  // final beat) and put the cursor on the board.
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      const s = derive(readP());
      snapRef.current = s;
      setSnap(s);
      place(aimAt(s.aim) ?? designState.current.design.rest);
    } else {
      place(designState.current.design.rest);
    }
    if (cursorRef.current) cursorRef.current.style.opacity = "1";
    // aimAt() reads the DOM this render just committed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = designRef.current;
    if (!root || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let live = true;
    let visible = false;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "12%" });
    io.observe(root);

    const tick = () => {
      if (!live) return;
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const s = derive(readP());
      if (keyOf(s) !== keyOf(snapRef.current)) {
        snapRef.current = s;
        setSnap(s);
      }

      const to = aimAt(s.aim);
      const pos = posRef.current;
      if (to) {
        pos.x += (to.x - pos.x) * 0.16;
        pos.y += (to.y - pos.y) * 0.16;
      }
      const cursor = cursorRef.current;
      if (cursor) cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      if (s.press !== pressRef.current) {
        pressedRef.current?.removeAttribute("data-press");
        pressedRef.current = null;
        if (cursor) delete cursor.dataset.pressed;
        if (s.press) {
          const el = stage.querySelector<HTMLElement>(`[data-target="${s.press}"]`);
          el?.setAttribute("data-press", "");
          pressedRef.current = el;
          if (cursor) cursor.dataset.pressed = "true";
          ripple(stage, posRef.current);
        }
        pressRef.current = s.press;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const d = design;
  const s = scale;

  return (
    <div className="ls-demo__inner">
      <div className="ls-demo__copy">
        <h2>{title}</h2>
        <p>{desc}</p>
        <ol className="ls-beats">
          {beats.map((b, i) => (
            <li
              key={i}
              data-on={snap.beat === i ? "" : undefined}
              data-done={snap.beat > i ? "" : undefined}
            >
              <span className="ls-beats__n" aria-hidden>
                {i + 1}
              </span>
              {b}
            </li>
          ))}
        </ol>
      </div>

      <div className="ls-demo__well">
        <div className="sd" ref={rootRef}>
          <div className="sd__fit" style={{ width: d.dw * s, height: d.dh * s }}>
            <div
              className="ss-stage sd__design"
              ref={designRef}
              style={{ width: d.dw, height: d.dh, transform: `scale(${s})` }}
            >
              <Phone
                width={d.pw}
                time="9:41"
                className="sd__phone"
                style={{ position: "absolute", left: d.px, top: d.py }}
              >
                {snap.screen === "home" ? (
                  <Home inserted={snap.inserted} order={snap.order} />
                ) : (
                  <Form chars={snap.chars} />
                )}
              </Phone>

              {d.wide && <Satellite order={snap.order} />}

              <Cursor cursorRef={cursorRef} kind={snap.kind} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── the two screens ─────────────────────────────────────────────────────── */

function Home({ inserted, order }: { inserted: boolean; order: boolean }) {
  const count = inserted ? 3 : 2;
  return (
    <div className="sd-app">
      <div className="sd-hd">
        <div>
          <div className="sd-hd__hi">Namaste, Sunita</div>
          <div className="sd-hd__sub">Sunita&rsquo;s Kitchen · Beed, MH</div>
        </div>
        <span className="sd-hd__live">
          <i aria-hidden />Shop live
        </span>
      </div>

      <div className="sd-earn">
        <span className="sd-earn__k">This week</span>
        <strong className="sd-earn__v">₹1,250</strong>
        <span className="sd-earn__m">9 orders · settled to UPI</span>
        <span className="sd-earn__bar" aria-hidden>
          <i style={{ width: "72%" }} />
        </span>
      </div>

      <div className="sd-lbl">
        Your products <span>{count}</span>
      </div>
      <div className="sd-list">
        <Row
          pad={13}
          lead={
            <span className="sd-thumb sd-thumb--haldi">
              <Leaf size={17} strokeWidth={2} />
            </span>
          }
          title="Haldi powder"
          subtitle="₹120 · 250 g"
          meta="12 sold"
        />
        <Row
          pad={13}
          lead={
            <span className="sd-thumb sd-thumb--gud">
              <Wheat size={17} strokeWidth={2} />
            </span>
          }
          title="Gud (jaggery)"
          subtitle="₹80 · 1 kg"
          meta="5 sold"
        />
        {inserted && (
          <Row
            pad={13}
            lead={
              <span className="sd-thumb sd-thumb--achar">
                <Flame size={17} strokeWidth={2} />
              </span>
            }
            title="Aam ka achar"
            subtitle="₹199 · 300 g"
            meta={<span className="sd-fresh">just now</span>}
          />
        )}
      </div>

      {order ? (
        <div className="sd-order">
          <span className="sd-order__ic sd-order__ic--ok">
            <Check size={15} strokeWidth={2.4} />
          </span>
          <span className="sd-order__t">
            <strong>New order · ₹199</strong>
            <span>Aam ka achar · paid by UPI</span>
          </span>
          <Badge tone="success" dot>
            PAID
          </Badge>
        </div>
      ) : (
        <div className="sd-order sd-order--idle">
          <span className="sd-order__ic">
            <Share2 size={14} strokeWidth={2} />
          </span>
          <span className="sd-order__t">
            <strong>No orders yet today</strong>
            <span>Share your shop link to get the first one.</span>
          </span>
        </div>
      )}

      <div className="sd-foot">
        <Button variant="primary" className="sd-cta" data-target="new">
          New product
        </Button>
      </div>
    </div>
  );
}

function Form({ chars }: { chars: number }) {
  return (
    <div className="sd-app">
      <div className="sd-hd sd-hd--form">
        <span className="sd-back" aria-hidden>
          <ArrowLeft size={17} strokeWidth={2.2} />
        </span>
        <div className="sd-hd__hi">New product</div>
      </div>

      <div className="sd-photo">
        <span className="sd-photo__ic">
          <Camera size={21} strokeWidth={1.8} />
        </span>
        <span className="sd-photo__t">Photo added</span>
        <span className="sd-photo__c">
          <Check size={11} strokeWidth={3} /> lit for you
        </span>
      </div>

      <Field
        className="sd-field"
        label="Product name"
        value={WORD.slice(0, chars)}
        placeholder="Speak or type"
        focused
        box={{ "data-target": "field" }}
      />
      <Field className="sd-field" label="Price (₹)" value="₹199" />

      <p className="sd-hint">Voice heard: “aam ka achar”</p>

      <div className="sd-foot">
        <Button variant="primary" className="sd-cta" data-target="publish">
          Publish to shop
        </Button>
      </div>
    </div>
  );
}

/** The one satellite: this week's payout, which becomes the order the moment
 *  it lands (a remount, so the swap pops instead of crossfading into mush). */
function Satellite({ order }: { order: boolean }) {
  return (
    <div key={order ? "order" : "payout"} className={`sd-sat${order ? " sd-sat--pop" : ""}`}>
      <span className={`sd-sat__ic${order ? " sd-sat__ic--ok" : ""}`}>
        {order ? <Check size={14} strokeWidth={2.6} /> : <Wallet size={14} strokeWidth={2} />}
      </span>
      <span className="sd-sat__t">
        <strong>{order ? "₹199 received" : "₹1,250 paid"}</strong>
        <span>{order ? "New order · UPI" : "This week's payout"}</span>
      </span>
    </div>
  );
}
