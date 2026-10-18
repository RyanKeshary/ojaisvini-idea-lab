"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Zap, Award, ShoppingBag, Volume2 } from "lucide-react";

interface SuperWomanPixelProps {
  locale?: string;
}

export function SuperWomanPixel({ locale = "en" }: SuperWomanPixelProps) {
  const [isSuper, setIsSuper] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [burstParticles, setBurstParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; size: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHindi = locale === "hi" || locale === "mr";

  // Play synthesized 8-bit superhero power-up chime on transformation
  const playChime = (superState: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (superState) {
        // Superhero power-up arpeggio: C4 -> E4 -> G4 -> C5 -> E5 -> G5
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.01, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.26);
        });
      } else {
        // Gentle descending soft chime
        const notes = [523.25, 392.0, 329.63];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.22);
        });
      }
    } catch {
      // AudioContext disallowed before user gesture in some contexts; ignore
    }
  };

  const handleToggle = () => {
    const nextState = !isSuper;
    setIsSuper(nextState);
    playChime(nextState);

    if (nextState) {
      // Spawn burst of 20 festive particles
      const colors = ["#F59E0B", "#EF4444", "#10B981", "#6366F1", "#EC4899", "#FCD34D"];
      const newParticles = Array.from({ length: 24 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 220 - 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.floor(Math.random() * 8) + 6,
      }));
      setBurstParticles(newParticles);
      setTimeout(() => setBurstParticles([]), 1200);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 14), y: x * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
      className="relative mx-auto w-full max-w-[310px] sm:max-w-[380px] cursor-pointer select-none group focus:outline-hidden"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      aria-label={
        isSuper
          ? isHindi
            ? "सशक्त सुपर दीदी! वापस सामान्य रूप में देखने के लिए क्लिक करें"
            : "Super Woman Entrepreneur! Click to return to artisan craft mode"
          : isHindi
            ? "ग्रामीण कारीगर दीदी। सुपर दीदी बनने के लिए क्लिक करें"
            : "Rural Artisan Woman crafting goods. Click to transform into Super Woman"
      }
      style={{
        perspective: "1000px",
      }}
    >
      {/* Dynamic 3D Card Wrapper */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border-2 bg-gradient-to-b from-stone-50 via-amber-50/40 to-emerald-50/30 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 p-3.5 sm:p-5 shadow-xl transition-all duration-300 group-hover:shadow-2xl"
        style={{
          borderColor: isSuper ? "var(--turmeric)" : "var(--border)",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dynamic Glow Background */}
        <div
          className={`absolute -inset-10 transition-opacity duration-700 pointer-events-none rounded-[40px] blur-3xl ${
            isSuper
              ? "opacity-60 bg-gradient-to-tr from-amber-400 via-rose-400 to-yellow-300 animate-pulse"
              : "opacity-30 bg-gradient-to-tr from-amber-200 via-emerald-200 to-teal-300"
          }`}
        />

        {/* Top Interactive Banner Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-[var(--border)] border-opacity-40">
          <div className="flex items-center gap-1.5">
            <span
              className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-bold transition-all shadow-xs ${
                isSuper
                  ? "bg-amber-400 text-stone-950 animate-bounce"
                  : "bg-[var(--turmeric)] text-[var(--primary-ink)]"
              }`}
            >
              {isSuper ? "⚡" : "🌸"}
            </span>
            <span className="text-xs font-extrabold tracking-tight text-[var(--fg)]">
              {isSuper
                ? isHindi
                  ? "सुपर उद्यमी दीदी"
                  : "Super Entrepreneur Didi"
                : isHindi
                  ? "हस्तकला कारीगर दीदी"
                  : "Rural Artisan Didi"}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide transition-all shadow-xs ${
              isSuper
                ? "bg-amber-500 text-stone-950 animate-pulse"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {isSuper ? <Zap className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {isSuper
              ? isHindi
                ? "लखपति दीदी पावर!"
                : "Lakhpati Power!"
              : isHindi
                ? "क्लिक करें 👆"
                : "Tap Me! 👆"}
          </span>
        </div>

        {/* 3D Pixel Art Canvas/SVG Stage */}
        <div className="relative z-10 my-2 flex h-[230px] sm:h-[270px] w-full items-center justify-center overflow-visible">
          {/* Burst Particles on Transform */}
          {burstParticles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none transition-all duration-1000 ease-out"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
                transform: `translate(${p.x}px, ${p.y}px) rotate(45deg)`,
                opacity: 0,
                transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s ease-out",
              }}
            />
          ))}

          {/* Golden Power Aura when Super */}
          {isSuper && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-56 w-56 rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-300/40 to-rose-400/30 blur-xl animate-spin" style={{ animationDuration: "12s" }} />
              <div className="absolute h-44 w-44 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="absolute h-48 w-48 rounded-full border border-yellow-300/40 animate-ping" style={{ animationDuration: "2.4s" }} />
            </div>
          )}

          {/* SVG 3D Pixel Art Figure */}
          <svg
            viewBox="0 0 200 220"
            className={`h-full w-auto transition-transform duration-500 ease-out drop-shadow-lg ${
              isSuper ? "scale-105 -translate-y-2" : "hover:scale-102"
            }`}
            style={{ imageRendering: "pixelated" }}
          >
            <defs>
              <filter id="pixel-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Shadow beneath character */}
            <ellipse
              cx="100"
              cy={isSuper ? "198" : "185"}
              rx={isSuper ? "36" : "50"}
              ry={isSuper ? "8" : "12"}
              fill="rgba(0, 0, 0, 0.18)"
              className="transition-all duration-500"
            />

            {/* ================= NORMAL CRAFT STATE ================= */}
            {!isSuper && (
              <g className="transition-opacity duration-300 animate-in fade-in">
                {/* Traditional Low Wooden Table (Chowki) */}
                <rect x="52" y="150" width="96" height="12" fill="#8B4513" rx="2" />
                <rect x="54" y="152" width="92" height="3" fill="#A0522D" />
                <rect x="56" y="162" width="8" height="22" fill="#653818" />
                <rect x="136" y="162" width="8" height="22" fill="#653818" />

                {/* Handcrafted Terracotta & Pickle Jars on Table */}
                {/* Mango Pickle Glass Jar (Aam ka Achaar) */}
                <rect x="62" y="128" width="18" height="22" fill="#FBBF24" rx="2" />
                <rect x="65" y="124" width="12" height="4" fill="#D97706" />
                <rect x="64" y="134" width="14" height="10" fill="#F59E0B" />
                <rect x="66" y="137" width="10" height="4" fill="#FEF3C7" />
                {/* Red Chili Pickle Jar */}
                <rect x="84" y="132" width="16" height="18" fill="#DC2626" rx="2" />
                <rect x="87" y="129" width="10" height="3" fill="#991B1B" />
                <rect x="86" y="136" width="12" height="8" fill="#EF4444" />
                {/* Terracotta Clay Diya / Pot */}
                <path d="M 112 136 Q 120 150 128 136 Z" fill="#B45309" />
                <circle cx="120" cy="133" r="3" fill="#F59E0B" className="animate-pulse" />

                {/* Rural Artisan Woman Sitting / Standing happily */}
                {/* Traditional Saree - Warm Saffron & Crimson Red with Gold Border */}
                {/* Saree Pleats & Skirt */}
                <rect x="76" y="102" width="48" height="66" fill="#C2410C" rx="4" />
                <rect x="80" y="102" width="6" height="66" fill="#B45309" />
                <rect x="94" y="102" width="6" height="66" fill="#9A3412" />
                <rect x="108" y="102" width="6" height="66" fill="#EA580C" />
                {/* Gold Zari Border on Saree Hem */}
                <rect x="76" y="164" width="48" height="4" fill="#F59E0B" />
                <rect x="76" y="165" width="48" height="1" fill="#FEF08A" />

                {/* Blouse & Pallu (Drape over shoulder) */}
                <rect x="80" y="74" width="40" height="30" fill="#047857" rx="3" />
                {/* Diagonal Pallu Drape */}
                <polygon points="80,74 96,74 124,104 108,104" fill="#EA580C" />
                <polygon points="94,74 97,74 124,104 121,104" fill="#F59E0B" />

                {/* Arms & Bangles (Glass bangles green & gold) */}
                {/* Left Arm stirring / crafting */}
                <rect x="68" y="80" width="12" height="24" fill="#D97706" rx="3" />
                <rect x="68" y="98" width="12" height="4" fill="#10B981" />
                <rect x="68" y="102" width="12" height="3" fill="#F59E0B" />
                <rect x="68" y="105" width="12" height="4" fill="#10B981" />
                {/* Right Arm resting proudly */}
                <rect x="120" y="80" width="12" height="24" fill="#D97706" rx="3" />
                <rect x="120" y="98" width="12" height="4" fill="#10B981" />
                <rect x="120" y="102" width="12" height="3" fill="#F59E0B" />
                <rect x="120" y="105" width="12" height="4" fill="#10B981" />

                {/* Neck & Gold Mangalsutra */}
                <rect x="94" y="64" width="12" height="12" fill="#D97706" />
                <path d="M 94 72 Q 100 78 106 72" stroke="#F59E0B" strokeWidth="2" fill="none" />

                {/* Face & Head */}
                <rect x="86" y="38" width="28" height="28" fill="#F59E0B" rx="6" />
                {/* Hair Bun & Traditional Gajra (Jasmine Flowers) */}
                <circle cx="100" cy="34" r="14" fill="#1C1917" />
                <rect x="84" y="30" width="32" height="12" fill="#1C1917" rx="4" />
                {/* White Jasmine Gajra flowers */}
                <circle cx="86" cy="34" r="2.5" fill="#FFFFFF" />
                <circle cx="91" cy="31" r="2.5" fill="#FFFFFF" />
                <circle cx="97" cy="30" r="2.5" fill="#FEF08A" />
                <circle cx="103" cy="30" r="2.5" fill="#FFFFFF" />
                <circle cx="109" cy="31" r="2.5" fill="#FFFFFF" />
                <circle cx="114" cy="34" r="2.5" fill="#FFFFFF" />

                {/* Eyes (Smiling & friendly) */}
                <rect x="91" y="49" width="4" height="4" fill="#1C1917" rx="1" />
                <rect x="105" y="49" width="4" height="4" fill="#1C1917" rx="1" />
                {/* Bright Red Bindi */}
                <circle cx="100" cy="45" r="2" fill="#DC2626" />
                {/* Gentle Smile */}
                <path d="M 96 58 Q 100 62 104 58" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Golden Earrings (Jhumkas) */}
                <polygon points="84,52 82,56 86,56" fill="#F59E0B" />
                <polygon points="116,52 114,56 118,56" fill="#F59E0B" />

                {/* Gentle Crafting Sparkles */}
                <circle cx="58" cy="120" r="2" fill="#F59E0B" className="animate-ping" style={{ animationDuration: "3s" }} />
                <circle cx="138" cy="122" r="2" fill="#10B981" className="animate-ping" style={{ animationDuration: "2.5s" }} />
              </g>
            )}

            {/* ================= SUPER WOMAN TRANSFORMATION ================= */}
            {isSuper && (
              <g className="transition-all duration-500 animate-in zoom-in-95">
                {/* Flowing Billowing Superhero Cape (Deep Saffron & Crimson with Gold Trim) */}
                <path
                  d="M 76 68 Q 40 100 36 170 Q 75 160 84 150 Z"
                  fill="#DC2626"
                  className="animate-pulse"
                />
                <path
                  d="M 124 68 Q 160 100 164 170 Q 125 160 116 150 Z"
                  fill="#DC2626"
                  className="animate-pulse"
                />
                {/* Cape Golden Borders */}
                <path d="M 36 170 Q 75 160 84 150" stroke="#F59E0B" strokeWidth="3" fill="none" />
                <path d="M 164 170 Q 125 160 116 150" stroke="#F59E0B" strokeWidth="3" fill="none" />

                {/* Ascending Floating Pose */}
                {/* Triumphant Saree Skirt in Flying Form */}
                <polygon points="80,94 120,94 130,165 70,165" fill="#B45309" />
                <polygon points="86,94 114,94 120,165 80,165" fill="#D97706" />
                {/* Gleaming Gold Border */}
                <rect x="70" y="162" width="60" height="5" fill="#FBBF24" />
                <rect x="70" y="164" width="60" height="1.5" fill="#FEF08A" />

                {/* Golden Armored Waist Belt (Kamarbandh) */}
                <rect x="80" y="90" width="40" height="6" fill="#F59E0B" rx="2" />
                <circle cx="100" cy="93" r="3" fill="#DC2626" />

                {/* Superhero Blouse with Radiant Star Emblem */}
                <rect x="80" y="66" width="40" height="26" fill="#047857" rx="3" />
                {/* Radiant Golden Star / 'O' Logo on Chest */}
                <circle cx="100" cy="78" r="8" fill="#F59E0B" filter="url(#pixel-glow)" />
                <text x="100" y="82" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1C1917">
                  ओ
                </text>

                {/* Triumphant Hero Pose Arms (Hands on hips or raised) */}
                {/* Left Arm on Hip (Confident) */}
                <path d="M 80 72 L 64 88 L 78 94" stroke="#D97706" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Golden Power Wrist Bracer */}
                <rect x="68" y="86" width="8" height="6" fill="#F59E0B" rx="1" />

                {/* Right Arm Raised to Sky in Triumphant Flight */}
                <path d="M 120 72 L 138 52 L 146 36" stroke="#D97706" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Golden Wrist Bracer & Fist */}
                <rect x="138" y="44" width="7" height="6" fill="#F59E0B" rx="1" />
                <circle cx="146" cy="36" r="4.5" fill="#F59E0B" filter="url(#pixel-glow)" />

                {/* Head & Confident Face */}
                <rect x="86" y="32" width="28" height="28" fill="#F59E0B" rx="6" />
                {/* Traditional Bun with Golden Tiara */}
                <circle cx="100" cy="28" r="14" fill="#1C1917" />
                <rect x="84" y="24" width="32" height="12" fill="#1C1917" rx="4" />
                {/* Glowing Golden Tiara / Matha Patti */}
                <path d="M 86 32 Q 100 24 114 32" stroke="#F59E0B" strokeWidth="3" fill="none" filter="url(#pixel-glow)" />
                <circle cx="100" cy="27" r="2.5" fill="#DC2626" />

                {/* Radiant Golden Bindi (Glowing Power Source) */}
                <circle cx="100" cy="40" r="3" fill="#DC2626" />
                <circle cx="100" cy="40" r="1.5" fill="#FEF08A" className="animate-ping" />

                {/* Confident Eyes & Radiant Smile */}
                <rect x="91" y="44" width="4.5" height="4.5" fill="#1C1917" rx="1" />
                <rect x="105" y="44" width="4.5" height="4.5" fill="#1C1917" rx="1" />
                <path d="M 95 53 Q 100 58 105 53" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* Floating Digital Empowerment Holograms */}
                {/* 1. Golden Rupee Symbol (Financial Independence) */}
                <g className="animate-bounce" style={{ animationDuration: "2s" }}>
                  <circle cx="50" cy="60" r="12" fill="#F59E0B" filter="url(#pixel-glow)" />
                  <text x="50" y="65" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1C1917">
                    ₹
                  </text>
                </g>

                {/* 2. QR Code Standee Hologram */}
                <g className="animate-pulse" style={{ animationDuration: "2.5s" }}>
                  <rect x="146" y="80" width="20" height="20" fill="#FFFFFF" stroke="#047857" strokeWidth="2" rx="3" />
                  <rect x="149" y="83" width="5" height="5" fill="#1C1917" />
                  <rect x="158" y="83" width="5" height="5" fill="#1C1917" />
                  <rect x="149" y="92" width="5" height="5" fill="#1C1917" />
                  <rect x="156" y="90" width="3" height="3" fill="#047857" />
                </g>

                {/* 3. Glowing Smartphone Voice AI Wave */}
                <g className="animate-bounce" style={{ animationDuration: "2.8s" }}>
                  <rect x="42" y="112" width="16" height="24" fill="#1C1917" rx="2" stroke="#F59E0B" strokeWidth="1" />
                  <rect x="44" y="115" width="12" height="16" fill="#10B981" />
                  <circle cx="50" cy="123" r="3" fill="#FFFFFF" className="animate-ping" />
                </g>

                {/* 4. Glowing Lakhpati Didi Star */}
                <polygon
                  points="155,120 157,125 162,126 158,130 159,135 155,132 151,135 152,130 148,126 153,125"
                  fill="#F59E0B"
                  filter="url(#pixel-glow)"
                  className="animate-spin"
                  style={{ animationDuration: "6s", transformOrigin: "155px 127px" }}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Bottom Interactive Info Bar */}
        <div
          className={`relative z-10 mt-1 rounded-2xl p-3 border transition-all ${
            isSuper
              ? "bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-yellow-500/20 border-amber-500/50"
              : "bg-white/80 dark:bg-stone-800/80 border-[var(--border)]"
          }`}
        >
          {isSuper ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-stone-950 font-bold shadow-xs shrink-0">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 leading-tight">
                    {isHindi ? "सशक्त लखपति दीदी" : "Empowered Lakhpati Didi"}
                  </p>
                  <p className="text-[10px] opacity-75 font-semibold">
                    {isHindi
                      ? "आवाज़ से व्यापार, सीधा UPI"
                      : "Voice AI + Direct UPI Commerce"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
                ₹1,450 / Day
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--clay-soft)] text-emerald-700 dark:text-emerald-300 font-bold shadow-xs shrink-0">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {isHindi ? "घरेलू अचार, पापड़ व हस्तशिल्प" : "Home Pickles & Crafts"}
                  </p>
                  <p className="text-[10px] opacity-70 font-medium">
                    {isHindi ? "क्लिक करें और सुपर रूप देखें!" : "Click to unleash superpower!"}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                {isHindi ? "कारीगर" : "Artisan"}
              </span>
            </div>
          )}
        </div>

        {/* Audio / Tap Feedback Prompt */}
        <div className="relative z-10 mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-500 dark:text-stone-400">
          <Volume2 className="h-3 w-3 opacity-60" />
          <span>
            {isSuper
              ? isHindi
                ? "वापस बदलने के लिए फिर से क्लिक करें 🔄"
                : "Click again to return to craft mode 🔄"
              : isHindi
                ? "सुपर दीदी बनने के लिए कहीं भी क्लिक करें 👆"
                : "Click anywhere on the card to empower her 👆"}
          </span>
        </div>
      </div>
    </div>
  );
}
