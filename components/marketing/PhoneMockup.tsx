"use client";

import { useState, useEffect } from "react";
import { Mic, Camera, Store, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";

/**
 * High-fidelity animated smartphone mockup showcasing the real Ojasvini app.
 * Responsive, sleek, and interactive across laptops and phones.
 */
export function PhoneMockup({ speak, snap, sell }: { speak: string; snap: string; sell: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      icon: <Mic className="h-5 w-5 text-amber-500" />,
      label: speak,
      sub: "Bolo: 'Aam ka Achaar ₹180'",
      badge: "Voice AI",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      icon: <Camera className="h-5 w-5 text-teal-600" />,
      label: snap,
      sub: "AI writes product description",
      badge: "Smart Vision",
      bg: "bg-teal-500/10 border-teal-500/30",
    },
    {
      icon: <Store className="h-5 w-5 text-indigo-600" />,
      label: sell,
      sub: "WhatsApp shop + instant UPI",
      badge: "Live Shop",
      bg: "bg-indigo-500/10 border-indigo-500/30",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      {/* Ambient background glow */}
      <div className="absolute -inset-4 rounded-[44px] bg-gradient-to-tr from-teal-400/20 via-emerald-300/15 to-amber-300/20 blur-2xl pointer-events-none" />

      {/* Phone Hardware Frame */}
      <div
        className="relative overflow-hidden rounded-[38px] border-[6px] border-stone-800/90 dark:border-stone-700 bg-stone-900 shadow-2xl transition-all"
        style={{ aspectRatio: "9/19" }}
        role="img"
        aria-label="Ojasvini phone app preview"
      >
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2.5 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="h-4 w-24 rounded-full bg-black/80 flex items-center justify-end px-2 gap-1.5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-teal-500/80 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-stone-700" />
          </div>
        </div>

        {/* Inner Phone Screen Content */}
        <div className="flex flex-col h-full w-full bg-[var(--bg)] text-[var(--fg)] pt-8 pb-4 px-3.5 select-none overflow-hidden">
          {/* Mock In-App Header */}
          <div className="flex items-center justify-between py-1.5 px-1 border-b border-[var(--border)] border-opacity-50">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--turmeric)] text-[var(--primary-ink)] font-bold text-xs">
                ओ
              </span>
              <span className="text-xs font-bold tracking-tight">ओजस्विनी</span>
            </div>
            <span className="text-[10px] font-semibold rounded-full bg-[var(--clay-soft)] px-2 py-0.5 text-[var(--primary-ink)]">
              🇮🇳 हिंदी
            </span>
          </div>

          {/* Voice Prompt Greeting Card */}
          <div className="mt-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--turmeric)] text-sm shadow-xs shrink-0">
                👩‍🏫
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--primary-ink)] truncate">सखी दीदी (Sakhi AI)</p>
                <p className="text-[10px] opacity-75 truncate">&ldquo;नमस्ते दीदी! आज क्या नया बेचना है?&rdquo;</p>
              </div>
            </div>
          </div>

          {/* 3 Step Interactive Workflow inside phone */}
          <div className="mt-3 flex flex-col gap-2 flex-1">
            {steps.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <div
                  key={s.label}
                  onClick={() => setActiveStep(i)}
                  className={`flex flex-col gap-1 rounded-xl p-2.5 border transition-all cursor-pointer ${
                    isActive
                      ? `${s.bg} shadow-xs scale-[1.02]`
                      : "bg-[var(--card)]/60 border-[var(--border)] opacity-60 hover:opacity-85"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/80 dark:bg-stone-800/80 shadow-xs">
                        {s.icon}
                      </span>
                      <span className="text-xs font-bold">{s.label}</span>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 pl-9 -mt-0.5 font-medium">{s.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Live Mock Earnings Ticker at bottom */}
          <div className="mt-auto rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-2.5 text-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[9px] uppercase tracking-wider opacity-85 leading-tight font-semibold">Today&apos;s Sales</p>
                <p className="text-xs font-bold leading-tight">₹1,450.00</p>
              </div>
            </div>
            <span className="text-[9px] bg-white/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" /> Paid
            </span>
          </div>

          {/* Phone Bottom Home Bar */}
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-20 rounded-full bg-stone-400 dark:bg-stone-600 opacity-60" />
          </div>
        </div>
      </div>

      {/* Floating Sparkle Pill badge */}
      <div className="absolute -bottom-3 -right-2 z-20 flex items-center gap-1.5 rounded-full bg-[var(--turmeric)] px-3 py-1 text-xs font-bold text-[var(--primary-ink)] shadow-md border border-white/40">
        <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
        <span>100% Mobile Ready</span>
      </div>
    </div>
  );
}
