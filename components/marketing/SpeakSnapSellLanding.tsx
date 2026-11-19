"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import "@/styles/speak-snap-sell.css";

export default function SpeakSnapSellLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [activeLang, setActiveLang] = useState("hi-IN");

  useEffect(() => {
    const st = document.getElementById("story");
    const ph = document.getElementById("ph");
    const sc = Array.from(document.querySelectorAll(".landing-sc"));
    const li = Array.from(document.querySelectorAll("#stl li"));
    const ch = Array.from(document.querySelectorAll(".landing-chip3"));
    const h1 = document.getElementById("landing-h1");
    const cp = document.getElementById("cp");
    const sp = document.getElementById("sp");
    const red = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cur = -1;
    let mx = 0;
    let my = 0;
    let tk = 0;

    function frame() {
      tk = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      const tot = document.documentElement.scrollHeight - h;

      if (sp) {
        sp.style.transform = `scaleX(${tot > 0 ? y / tot : 0})`;
      }

      if (y < h * 1.3) {
        document.querySelectorAll<HTMLElement>(".landing-fl").forEach((f) => {
          const z = Number(f.dataset.z || 0);
          f.style.transform = `translate3d(${-mx * z}px, ${-my * z - (y * z) / 160}px, 0)`;
        });
        if (!red && h1) {
          h1.style.transform = `rotateX(${-my * 8}deg) rotateY(${mx * 10}deg)`;
        }
      }

      if (st && ph) {
        const r = st.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height - h)));
        ph.style.transform = `rotateX(${14 - 20 * p}deg) rotateY(${-30 + 60 * p}deg) rotateZ(${-5 + 10 * p}deg)`;
        const i = Math.min(3, Math.floor(p * 4));
        const pb = document.getElementById("pb");
        if (pb) pb.style.width = `${p * 100}%`;

        if (i !== cur) {
          cur = i;
          sc.forEach((e, k) => e.classList.toggle("on", k === i));
          li.forEach((e, k) => e.classList.toggle("on", k === i));
          ch.forEach((e, k) => e.classList.toggle("on", k === i));
        }
      }

      if (cp) {
        const q = cp.getBoundingClientRect();
        cp.style.setProperty("--cx", `${Math.max(0, Math.min(18, ((q.top - h * 0.45) / h) * 28))}deg`);
      }
    }

    const req = () => {
      if (!tk) {
        tk = 1;
        requestAnimationFrame(frame);
      }
    };

    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);

    const onPointerMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      req();
    };

    if (!red) {
      window.addEventListener("pointermove", onPointerMove);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".landing-rv").forEach((e) => io.observe(e));

    const cardListeners: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    document.querySelectorAll<HTMLElement>(".landing-fi").forEach((c) => {
      const move = (e: MouseEvent) => {
        if (red) return;
        const b = c.getBoundingClientRect();
        c.style.setProperty("--ry", `${((e.clientX - b.left) / b.width - 0.5) * 14}deg`);
        c.style.setProperty("--rx", `${-((e.clientY - b.top) / b.height - 0.5) * 14}deg`);
      };
      const leave = () => {
        c.style.setProperty("--rx", "0deg");
        c.style.setProperty("--ry", "0deg");
      };
      c.addEventListener("pointermove", move);
      c.addEventListener("pointerleave", leave);
      cardListeners.push({ el: c, move, leave });
    });

    frame();

    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      if (!red) {
        window.removeEventListener("pointermove", onPointerMove);
      }
      io.disconnect();
      cardListeners.forEach(({ el, move, leave }) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    };
  }, []);

  const speak = (text: string, lang: string) => {
    setActiveLang(lang);
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        window.speechSynthesis.speak(u);
      }
    } catch {
      // silent fallback
    }
  };

  return (
    <div className="landing-body" id="main-content">
      <div id="sp" />

      {/* Header */}
      <header className="landing-nav">
        <Link className="landing-logo" href="#top">
          <b>O</b>Ojasvini
        </Link>
        <nav>
          <a href="#story">How it works</a>
          <a href="#video">Watch Demo</a>
          <a href="#lang">Languages</a>
          <a href="#feat">Everything in one place</a>
          <a href="#jr">Her journey</a>
        </nav>
        <Link className="landing-btn cta sm" href="/app/home">
          Open Dashboard
        </Link>
      </header>

      {/* Hero */}
      <section className="landing-hero" id="top">
        <div className="landing-s3d" aria-hidden="true">
          <div className="landing-fl" data-z="40" style={{ right: "11%", top: "10%" }}>
            <div className="landing-coin">
              <i>₹</i>
              <i className="k">₹</i>
            </div>
          </div>
          <div className="landing-fl" data-z="70" style={{ right: "24%", bottom: "12%" }}>
            <div className="landing-orb">🎤</div>
          </div>
          <div className="landing-fl landing-hm" data-z="26" style={{ right: "5%", bottom: "30%" }}>
            <div className="landing-pc">
              📸<b>Mango pickle</b>
              <span>₹150</span>
            </div>
          </div>
          <div className="landing-fl" data-z="54" style={{ right: "6%", top: "42%" }}>
            <div className="landing-pay">
              <b>₹176 paid</b>
              <span>UPI · just now</span>
            </div>
          </div>
        </div>

        <div className="landing-w">
          <h1 id="landing-h1">
            <span>Speak.</span> <span>Snap.</span> <span>Sell<em>.</em></span>
          </h1>
          <p>
            Turn a photo and your voice into a live shop. Get paid by UPI. Free, works offline, in your language.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link className="landing-btn cta" href="/app/home">
              Open Dashboard
            </Link>
            <a className="landing-btn" href="#story">
              See how it works
            </a>
          </div>
          <small>Hindi · Marathi · Gujarati · Tamil · English · Works offline · Free to start</small>
        </div>
        <div className="landing-cue">Scroll ↓</div>
      </section>

      {/* 3D Scroll-driven Scrollytelling Phone */}
      <section id="story">
        <div className="landing-stick">
          <div>
            <h2>Scroll to make a sale</h2>
            <p>Keep scrolling. One sentence and one photo become a shop that gets paid.</p>
            <ol id="stl">
              <li className="on">
                <b>1</b>
                <span>
                  Speak what you make
                  <div>Say it in your language. No typing.</div>
                </span>
              </li>
              <li>
                <b>2</b>
                <span>
                  Snap and list
                  <div>AI drafts the title and a fair village price.</div>
                </span>
              </li>
              <li>
                <b>3</b>
                <span>
                  Your shop goes live
                  <div>Share one link or QR on WhatsApp.</div>
                </span>
              </li>
              <li>
                <b>4</b>
                <span>
                  Get paid by UPI
                  <div>Orders arrive. Money goes to your account.</div>
                </span>
              </li>
            </ol>
            <div className="pbw">
              <i id="pb" />
            </div>
          </div>

          <div className="landing-sc3">
            <div className="landing-phone" id="ph">
              <div>
                <div className="landing-scr">
                  <div className="landing-sc on">
                    <h4>Namaste, Sunita</h4>
                    <h5>Tap and say what you make</h5>
                    <div className="landing-mic">🎤</div>
                    <div className="landing-wv">
                      <i /><i /><i /><i /><i /><i /><i />
                    </div>
                    <div className="landing-bub">मी आंब्याचं लोणचं बनवते</div>
                  </div>
                  <div className="landing-sc">
                    <h4>Your listing draft</h4>
                    <h5>Check it, then publish</h5>
                    <div className="landing-lc">
                      <div className="e">🥭</div>
                      <h4 style={{ margin: "6px 0" }}>Mango pickle</h4>
                      <span className="landing-tg">Food</span>
                      <div className="landing-rg">
                        <i />
                      </div>
                      <h5 style={{ margin: 0 }}>Village price ₹120 – ₹160 · yours ₹150</h5>
                    </div>
                    <span className="landing-pbn">Publish shop</span>
                  </div>
                  <div className="landing-sc">
                    <h4>Sunita’s Swad</h4>
                    <h5>Your shop is live</h5>
                    <div className="landing-url">ojaisvini-idea-lab.vercel.app/shop/sunita-swad</div>
                    <div className="landing-qr" />
                    <span className="landing-pbn">Share on WhatsApp</span>
                  </div>
                  <div className="landing-sc">
                    <h4>New order</h4>
                    <h5>Mango pickle × 2 · Pune</h5>
                    <div className="landing-ok">✓</div>
                    <div className="landing-amt">₹176</div>
                    <h5 style={{ textAlign: "center" }}>Paid by UPI, after fees</h5>
                    <span className="landing-pbn">Withdraw to my UPI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="landing-chip3" style={{ left: "2%", top: "18%" }}>
              🎙 Heard in Marathi
            </div>
            <div className="landing-chip3" style={{ right: 0, top: "26%" }}>
              📸 Fair price: ₹120–₹160
            </div>
            <div className="landing-chip3" style={{ left: 0, bottom: "22%" }}>
              🔗 Shop link ready
            </div>
            <div className="landing-chip3" style={{ right: "2%", bottom: "20%" }}>
              ₹176 received
            </div>
          </div>
        </div>
      </section>

      {/* Mid-section Product Film Video Player */}
      <section className="landing-sec landing-video-sec" id="video">
        <div className="landing-w">
          <div className="landing-hd">
            <div>
              <h2>Watch Ojasvini in Action</h2>
              <p>20 seconds: From recording a voice note to earning via UPI.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (videoRef.current) videoRef.current.muted = next;
              }}
              className="landing-btn sm"
              style={{ display: "inline-flex", gap: "6px" }}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {muted ? "Unmute Voiceover" : "Mute Sound"}
            </button>
          </div>
          <div className="landing-video-card">
            <video
              ref={videoRef}
              src="/films/ojasvini.mp4"
              poster="/films/ojasvini-poster.jpg"
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="landing-sec" id="lang" style={{ paddingTop: 0 }}>
        <div className="landing-w">
          <div className="landing-hd">
            <h2>Tap a language to hear it</h2>
            <p>Every screen can speak, so nobody has to read.</p>
          </div>
          <div className="landing-lang">
            <button
              type="button"
              className={activeLang === "hi-IN" ? "on" : ""}
              onClick={() => speak("नमस्ते, ओजस्विनी में आपका स्वागत है", "hi-IN")}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={activeLang === "mr-IN" ? "on" : ""}
              onClick={() => speak("नमस्कार, ओजस्विनी मध्ये आपले स्वागत आहे", "mr-IN")}
            >
              मराठी
            </button>
            <button
              type="button"
              className={activeLang === "gu-IN" ? "on" : ""}
              onClick={() => speak("નમસ્તે, ઓજસ્વિનીમાં તમારું સ્વાગત છે", "gu-IN")}
            >
              ગુજરાતી
            </button>
            <button
              type="button"
              className={activeLang === "ta-IN" ? "on" : ""}
              onClick={() => speak("வணக்கம், ஓஜஸ்வினிக்கு வரவேற்கிறோம்", "ta-IN")}
            >
              தமிழ்
            </button>
            <button
              type="button"
              className={activeLang === "en-IN" ? "on" : ""}
              onClick={() => speak("Welcome to Ojasvini. Speak, snap and sell.", "en-IN")}
            >
              English
            </button>
          </div>
        </div>
      </section>

      {/* Everything in one place */}
      <section className="landing-sec" id="feat" style={{ paddingTop: 0 }}>
        <div className="landing-w">
          <div className="landing-hd">
            <h2>Everything in one place</h2>
            <p>Sell, learn, get funded and ask for help in one app.</p>
          </div>
          <div className="landing-fg">
            <div className="landing-rv">
              <article className="landing-fi">
                <i>🎓</i>
                <h3>Digital skills</h3>
                <p>Two-minute lessons with practice simulators for UPI and WhatsApp.</p>
              </article>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.1s" }}>
              <article className="landing-fi">
                <i>🎙</i>
                <h3>Voice assistant</h3>
                <p>Tap, speak, done. It works on every screen.</p>
              </article>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.2s" }}>
              <article className="landing-fi">
                <i>📊</i>
                <h3>Seller dashboard</h3>
                <p>Earnings, orders and a sales forecast, read aloud.</p>
              </article>
            </div>
            <div className="landing-rv">
              <article className="landing-fi">
                <i>🤖</i>
                <h3>Sakhi Didi assistant</h3>
                <p>Ask business questions and get answers in your language.</p>
              </article>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.1s" }}>
              <article className="landing-fi">
                <i>📸</i>
                <h3>Photo to listing</h3>
                <p>One photo becomes a full shop listing with a fair price.</p>
              </article>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.2s" }}>
              <article className="landing-fi">
                <i>🛡</i>
                <h3>Scheme finder</h3>
                <p>See only the government schemes you qualify for.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Her Journey */}
      <section className="landing-sec" id="jr" style={{ paddingTop: 0 }}>
        <div className="landing-w">
          <div className="landing-hd">
            <h2>Her journey</h2>
            <p>From first lesson to a growing business.</p>
          </div>
          <div className="landing-jr">
            <div className="landing-rv">
              <div className="landing-jc">
                <h4>Step 1</h4>
                <h3>Discover</h3>
                <p>Voice onboarding in her language.</p>
              </div>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.1s" }}>
              <div className="landing-jc">
                <h4>Step 2</h4>
                <h3>Learn</h3>
                <p>Short lessons on UPI, photos and pricing.</p>
              </div>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.2s" }}>
              <div className="landing-jc">
                <h4>Step 3</h4>
                <h3>Create</h3>
                <p>Speak, snap, AI listing.</p>
              </div>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.3s" }}>
              <div className="landing-jc">
                <h4>Step 4</h4>
                <h3>Sell</h3>
                <p>Live shop, demo payments, orders.</p>
              </div>
            </div>
            <div className="landing-rv" style={{ ["--d" as any]: "0.4s" }}>
              <div className="landing-jc">
                <h4>Step 5</h4>
                <h3>Grow</h3>
                <p>Earnings, schemes and community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-cta3">
        <div className="landing-w">
          <div className="landing-cp" id="cp">
            <h2>Your first order is one photo away.</h2>
            <Link className="landing-btn cta" href="/app/home">
              Open Dashboard
            </Link>
            <small>Demo mode: no real money, no real SMS.</small>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>Ojasvini · Made with respect in Maharashtra</span>
        <span>Don’t force the woman to learn technology. Make the technology adapt to her.</span>
      </footer>
    </div>
  );
}
