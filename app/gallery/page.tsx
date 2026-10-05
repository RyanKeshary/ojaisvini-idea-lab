"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePrefs } from "@/lib/store/prefs";
import { VoiceOrb, type OrbState } from "@/components/voice/VoiceOrb";
import { ListenButton } from "@/components/voice/ListenButton";
import { OjasDidi, type DidiMood } from "@/components/ui/OjasDidi";
import { BigButton } from "@/components/ui/BigButton";
import { IconLabelTile } from "@/components/ui/IconLabelTile";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { StepDots } from "@/components/ui/StepDots";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProductCard } from "@/components/ui/ProductCard";
import { StorefrontHero } from "@/components/ui/StorefrontHero";
import { PriceTag } from "@/components/ui/PriceTag";
import { StatusPill } from "@/components/ui/StatusPill";
import { EarningsCounter } from "@/components/ui/EarningsCounter";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideRail } from "@/components/ui/SideRail";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { SchemeCard } from "@/components/ui/SchemeCard";
import { PostCard } from "@/components/ui/PostCard";
import { SakhiCard } from "@/components/ui/SakhiCard";
import { OTPInput } from "@/components/ui/OTPInput";
import { PinPad } from "@/components/ui/PinPad";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { PaymentSheet } from "@/components/ui/PaymentSheet";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { toast } from "@/components/ui/Toast";

const ORBS: OrbState[] = ["idle", "listening", "thinking", "speaking", "success"];
const MOODS: DidiMood[] = ["greeting", "listening", "thinking", "celebrating"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }} aria-label={title}>
      <h2 className="display mb-3 text-2xl font-bold">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function GalleryPage() {
  const t = useTranslations("gallery");
  const { theme, setTheme, reduceMotion, setReduceMotion } = usePrefs();
  const [orb, setOrb] = useState<OrbState>("idle");
  const [sheet, setSheet] = useState(false);
  const [otp, setOtp] = useState("123456");
  const [pin, setPin] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-44 pt-6">
      <header>
        <h1 className="display text-4xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-base opacity-75">{t("subtitle")}</p>
      </header>

      <Section title="Language · Theme · Motion">
        <LanguageChip />
        <button type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="min-h-[56px] rounded-full border-2 px-5 font-bold" aria-pressed={theme === "dark"}>
          Theme: {theme}
        </button>
        <button type="button" onClick={() => setReduceMotion(!reduceMotion)} className="min-h-[56px] rounded-full border-2 px-5 font-bold" aria-pressed={reduceMotion}>
          Reduce motion: {reduceMotion ? "on" : "off"}
        </button>
        <ListenButton text="Gallery. Har component, har state." />
      </Section>

      <Section title="VoiceOrb states">
        {ORBS.map((s) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <VoiceOrb state={orb === s ? s : s} size={88} amplitude={0.7} onTap={() => setOrb(s)} label={`Orb ${s}`} />
            <button type="button" onClick={() => setOrb(s)} className="text-sm font-bold underline" aria-pressed={orb === s}>{s}</button>
          </div>
        ))}
      </Section>

      <Section title="OjasDidi moods">
        {MOODS.map((m) => (
          <div key={m} className="flex flex-col items-center gap-1">
            <OjasDidi mood={m} speaking={m === "listening"} size={96} />
            <span className="text-sm font-bold">{m}</span>
          </div>
        ))}
      </Section>

      <Section title="Buttons & tiles">
        <div className="flex w-full flex-col gap-2">
          <BigButton onClick={() => toast("Published")}>Publish karein</BigButton>
          <BigButton variant="secondary">Secondary</BigButton>
          <BigButton variant="danger">Delete</BigButton>
          <BigButton state="loading">Loading</BigButton>
          <BigButton state="success">Done</BigButton>
        </div>
        <IconLabelTile icon="🥘" label="Papad" hint="food" selected />
        <IconLabelTile icon="🧵" label="Tailoring" />
        <StepDots total={5} current={2} />
      </Section>

      <Section title="Commerce">
        <ProductCard title="Ghar ka aam ka achaar" price={150} status="LIVE" />
        <div className="flex flex-col gap-2">
          <PriceTag amount={150} spoken="ek sau pachaas rupaye" />
          <StatusPill status="PAID" />
          <StatusPill status="DELIVERED" />
          <StatusPill status="PENDING_PAYMENT" />
        </div>
        <div className="w-full"><StorefrontHero shopName="Sunita Papad Ghar" greeting="Namaskar! Ghar ka bana samaan." /></div>
        <div className="w-full"><PaymentSheet total={300} /></div>
        <div className="w-full"><OrderTimeline current="PREPARING" /></div>
        <EarningsCounter value={2450} />
      </Section>

      <Section title="Auth inputs">
        <div className="w-full"><OTPInput value={otp} onChange={setOtp} /></div>
        <div className="w-full max-w-xs"><PinPad value={pin} onChange={(v) => setPin(v.slice(0, 4))} /></div>
      </Section>

      <Section title="Content & help">
        <SchemeCard name="MUDRA Yojana" benefit="Bina guarantee loan" match />
        <PostCard author="Sunita · Nashik" text="Pehli order mili! Dhanyavaad." audio />
        <SakhiCard name="Asha Tai" area="Nashik" langs="Marathi, Hindi" />
        <EmptyState icon="🧺" title="No orders yet" hint="First order yahin dikhega." />
        <SkeletonCard />
        <div className="w-full"><CameraCapture /></div>
      </Section>

      <Section title="Overlays">
        <BigButton variant="secondary" onClick={() => setSheet(true)}>Open sheet</BigButton>
        <div className="relative grid h-40 w-full place-items-center overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border)" }}>
          <ConfettiBurst fire />
          <span className="font-bold">Confetti burst</span>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Demo sheet">
          <p>Drag down to dismiss. Spring 300/30.</p>
          <div className="mt-3"><BigButton onClick={() => setSheet(false)}>Close</BigButton></div>
        </Sheet>
      </Section>

      <Section title="Nav shells (preview)">
        <div className="w-full overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border)" }}>
          <div className="hidden lg:block"><SideRail /></div>
          <p className="p-3 text-sm opacity-70">BottomNav renders on mobile; SideRail on desktop. This page shows SideRail below lg via preview.</p>
        </div>
      </Section>

      <OfflineBanner />
      <div className="lg:hidden"><BottomNav /></div>
    </main>
  );
}
