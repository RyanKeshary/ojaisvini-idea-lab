import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { ListenButton } from "@/components/voice/ListenButton";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { OjasDidi } from "@/components/ui/OjasDidi";
import { Reveal } from "@/components/marketing/Reveal";
import { SuperWomanPixel } from "@/components/marketing/SuperWomanPixel";
import { DownloadAppButton } from "@/components/marketing/DownloadAppButton";
import {
  Mic,
  Camera,
  Store,
  WifiOff,
  Languages,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type LandingMicroCopy = {
  initiativePill: string;
  listenHint: string;
  voiceFirst: string;
  photoAi: string;
  languagesBadge: string;
  offlineBadge: string;
  downloadLabel: string;
  downloadSublabel: string;
  dashboardCta: string;
  startSellingToday: string;
  freeForever: string;
  footerMadeWith: string;
  sampleShopLabel: string;
  faqHeader: string;
  fieldExperience: string;
  compareHeader: string;
  continueShop: string;
  didiFallback: string;
};

const microCopy: Record<string, LandingMicroCopy> = {
  en: {
    initiativePill: "Digital Commerce for Rural Women Micro-Entrepreneurs",
    listenHint: "Click to hear aloud",
    voiceFirst: "Voice-First",
    photoAi: "Photo AI Listing",
    languagesBadge: "8 Indian Languages",
    offlineBadge: "Works Offline",
    downloadLabel: "📲 Download App",
    downloadSublabel: "Install on phone",
    dashboardCta: "Open Dashboard",
    startSellingToday: "Start Selling Today",
    freeForever: "Free forever for rural micro-entrepreneurs. No commission, no hidden charges.",
    footerMadeWith: "Made with ❤️ for Indian Rural Women",
    sampleShopLabel: "See a sample shop",
    faqHeader: "Frequently Asked Questions",
    fieldExperience: "Field Experience & Impact",
    compareHeader: "Why Ojasvini is Different",
    continueShop: "Continue to Your Shop",
    didiFallback: "Sister",
  },
  hi: {
    initiativePill: "ग्रामीण महिला सूक्ष्म उद्यमियों के लिए डिजिटल व्यापार",
    listenHint: "सुनने के लिए क्लिक करें",
    voiceFirst: "आवाज़ आधारित",
    photoAi: "फोटो AI लिस्टिंग",
    languagesBadge: "8 भारतीय भाषाएँ",
    offlineBadge: "ऑफ़लाइन काम करता है",
    downloadLabel: "📲 ऐप डाउनलोड करें",
    downloadSublabel: "फ़ोन में इंस्टॉल करें",
    dashboardCta: "डैशबोर्ड खोलें",
    startSellingToday: "आज ही बेचना शुरू करें",
    freeForever: "ग्रामीण महिला उद्यमियों के लिए सदा मुफ़्त। शून्य कमीशन, शून्य शुल्क।",
    footerMadeWith: "भारतीय ग्रामीण महिलाओं के लिए ❤️ से निर्मित",
    sampleShopLabel: "नमूना दुकान देखें",
    faqHeader: "अक्सर पूछे जाने वाले सवाल",
    fieldExperience: "जमीनी अनुभव व प्रभाव",
    compareHeader: "ओजस्विनी क्यों अलग है",
    continueShop: "अपनी दुकान पर जाएँ",
    didiFallback: "दीदी",
  },
  mr: {
    initiativePill: "ग्रामीण महिला सूक्ष्म उद्योजकांसाठी डिजिटल व्यासपीठ",
    listenHint: "ऐकण्यासाठी क्लिक करा",
    voiceFirst: "आवाजावर आधारित",
    photoAi: "फोटो AI लिस्टिंग",
    languagesBadge: "8 भारतीय भाषा",
    offlineBadge: "ऑफलाईन चालते",
    downloadLabel: "📲 ॲप डाउनलोड करा",
    downloadSublabel: "फोनवर स्थापित करा",
    dashboardCta: "डॅशबोर्ड उघडा",
    startSellingToday: "आजच विक्री सुरू करा",
    freeForever: "ग्रामीण सूक्ष्म उद्योजकांसाठी सदैव मोफत. कोणतेही कमिशन नाही.",
    footerMadeWith: "भारतीय ग्रामीण महिलांसाठी ❤️ ने तयार",
    sampleShopLabel: "नमुना दुकान पहा",
    faqHeader: "वारंवार विचारले जाणारे प्रश्न",
    fieldExperience: "क्षेत्रीय अनुभव व प्रभाव",
    compareHeader: "ओजस्विनी वेगळे का आहे",
    continueShop: "तुमच्या दुकानात जा",
    didiFallback: "दीदी",
  },
  gu: {
    initiativePill: "ગ્રામીણ મહિલા સૂક્ષ્મ ઉદ્યોગસાહસિકો માટે ડિજિટલ વેપાર",
    listenHint: "સાંભળવા માટે ક્લિક કરો",
    voiceFirst: "અવાજ આધારિત",
    photoAi: "ફોટો AI લિસ્ટિંગ",
    languagesBadge: "8 ભારતીય ભાષાઓ",
    offlineBadge: "ઑફલાઇન કાર્ય કરે છે",
    downloadLabel: "📲 એપ ડાઉનલોડ કરો",
    downloadSublabel: "ફોનમાં ઇન્સ્ટોલ કરો",
    dashboardCta: "ડેશબોર્ડ ખોલો",
    startSellingToday: "આજે જ વેચાણ શરૂ કરો",
    freeForever: "ગ્રામીણ મહિલાઓ માટે કાયમ મફત. કોઈ કમિશન નહીં.",
    footerMadeWith: "ભારતીય ગ્રામીણ મહિલાઓ માટે ❤️ થી બનેલ",
    sampleShopLabel: "નમૂનાની દુકાન જુઓ",
    faqHeader: "વારંવાર પૂછાતા પ્રશ્નો",
    fieldExperience: "ક્ષેત્રીય અનુભવ અને પ્રભાવ",
    compareHeader: "ઓજસ્વિની શા માટે અલગ છે",
    continueShop: "તમારી દુકાનમાં જાઓ",
    didiFallback: "બહેન",
  },
  ta: {
    initiativePill: "கிராமப்புற பெண்கள் குறுந்தொழில் முனைவோருக்கான டிஜிட்டல் வர்த்தகம்",
    listenHint: "கேட்க கிளிக் செய்க",
    voiceFirst: "குரல் வழி",
    photoAi: "புகைப்பட AI பட்டியல்",
    languagesBadge: "8 இந்திய மொழிகள்",
    offlineBadge: "ஆஃப்லைனிலும் இயங்கும்",
    downloadLabel: "📲 செயலியைப் பதிவிறக்குக",
    downloadSublabel: "போனில் நிறுவுக",
    dashboardCta: "டாஷ்போர்டைத் திறக்கவும்",
    startSellingToday: "இன்றே விற்பனையைத் தொடங்குங்கள்",
    freeForever: "கிராமப்புற பெண் தொழில்முனைவோருக்கு எப்போதும் இலவசம்.",
    footerMadeWith: "இந்திய கிராமப்புற பெண்களுக்காக ❤️ உடன் உருவாக்கப்பட்டது",
    sampleShopLabel: "மாதிரி கடையைப் பார்க்கவும்",
    faqHeader: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    fieldExperience: "கள அனுபவம் மற்றும் தாக்கம்",
    compareHeader: "ஓஜஸ்வினி ஏன் வேறுபட்டது",
    continueShop: "உங்கள் கடைக்குச் செல்லுங்கள்",
    didiFallback: "சகோதரி",
  },
  te: {
    initiativePill: "గ్రామీణ మహిళా సూక్ష్మ వ్యవస్థాపకుల కోసం డిజిటల్ వాణిజ్యం",
    listenHint: "వినడానికి క్లిక్ చేయండి",
    voiceFirst: "వాయిస్ ఆధారితం",
    photoAi: "ఫోటో AI జాబితా",
    languagesBadge: "8 భారతీయ భాషలు",
    offlineBadge: "ఆఫ్‌లైన్‌లో పనిచేస్తుంది",
    downloadLabel: "📲 యాప్‌ను డౌన్‌లోడ్ చేయండి",
    downloadSublabel: "ఫోన్‌లో ఇన్‌స్టాల్ చేయండి",
    dashboardCta: "డ్యాష్‌బోర్డ్ తెరవండి",
    startSellingToday: "ఈరోజే అమ్మకం ప్రారంభించండి",
    freeForever: "గ్రామీణ మహిళా వ్యవస్థాపకులకు ఎల్లప్పుడూ ఉచితం. కమిషన్ లేదు.",
    footerMadeWith: "భారతీయ గ్రామీణ మహిళల కోసం ❤️తో రూపొందించబడింది",
    sampleShopLabel: "నమూనా దుకాణాన్ని చూడండి",
    faqHeader: "తరచుగా అడిగే ప్రశ్నలు",
    fieldExperience: "క్షేత్ర స్థాయి అనుభవం మరియు ప్రభావం",
    compareHeader: "ఓజస్విని ఎందుకు ప్రత్యేకమైనది",
    continueShop: "మీ దుకాణానికి వెళ్ళండి",
    didiFallback: "సోదరి",
  },
  kn: {
    initiativePill: "ಗ್ರಾಮೀಣ ಮಹಿಳಾ ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ವಾಣಿಜ್ಯ",
    listenHint: "ಕೇಳಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    voiceFirst: "ಧ್ವನಿ ಆಧಾರಿತ",
    photoAi: "ಫೋಟೋ AI ಪಟ್ಟಿ",
    languagesBadge: "8 ಭಾರತೀಯ ಭಾಷೆಗಳು",
    offlineBadge: "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    downloadLabel: "📲 ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    downloadSublabel: "ಫೋನ್‌ನಲ್ಲಿ ಸ್ಥಾಪಿಸಿ",
    dashboardCta: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
    startSellingToday: "ಇಂದೇ ಮಾರಾಟ ಪ್ರಾರಂಭಿಸಿ",
    freeForever: "ಗ್ರಾಮೀಣ ಉದ್ಯಮಿಗಳಿಗೆ ಸದಾ ಉಚಿತ. ಯಾವುದೇ ಕಮಿಷನ್ ಇಲ್ಲ.",
    footerMadeWith: "ಭಾರತೀಯ ಗ್ರಾಮೀಣ ಮಹಿಳೆಯರಿಗಾಗಿ ❤️ಯಿಂದ ರಚಿಸಲಾಗಿದೆ",
    sampleShopLabel: "ಮಾದರಿ ಅಂಗಡಿ ನೋಡಿ",
    faqHeader: "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
    fieldExperience: "ಕ್ಷೇತ್ರ ಅನುಭವ ಮತ್ತು ಪ್ರಭಾವ",
    compareHeader: "ಓಜಸ್ವಿನಿ ಏಕೆ ವಿಭಿನ್ನವಾಗಿದೆ",
    continueShop: "ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಮುಂದುವರಿಯಿರಿ",
    didiFallback: "ಸಹೋದರಿ",
  },
  bn: {
    initiativePill: "গ্রামীণ নারী ক্ষুদ্র উদ্যোক্তাদের জন্য ডিজিটাল বাণিজ্য",
    listenHint: "শুনতে ক্লিক করুন",
    voiceFirst: "কণ্ঠস্বর ভিত্তিক",
    photoAi: "ছবি থেকে AI লিস্টিং",
    languagesBadge: "৮টি ভারতীয় ভাষা",
    offlineBadge: "অফলাইনে চলে",
    downloadLabel: "📲 অ্যাপ ডাউনলোড করুন",
    downloadSublabel: "ফোনে ইনস্টল করুন",
    dashboardCta: "ড্যাশবোর্ড খুলুন",
    startSellingToday: "আজই বিক্রি শুরু করুন",
    freeForever: "গ্রামীণ নারী উদ্যোক্তাদের জন্য সর্বদা বিনামূল্যে। কোনো কমিশন নেই।",
    footerMadeWith: "ভারতীয় গ্রামীণ নারীদের জন্য ❤️ দিয়ে তৈরি",
    sampleShopLabel: "নমুনা দোকান দেখুন",
    faqHeader: "সাধারণ প্রশ্নাবলি",
    fieldExperience: "মাঠপর্যায়ের অভিজ্ঞতা ও প্রভাব",
    compareHeader: "ওজস্বিনী কেন আলাদা",
    continueShop: "আপনার দোকানে যান",
    didiFallback: "দিদি",
  },
};

const brandLetters: Record<string, string> = {
  en: "O",
  hi: "ओ",
  mr: "ओ",
  gu: "ઓ",
  ta: "ஓ",
  te: "ఓ",
  kn: "ಓ",
  bn: "ও",
};

/**
 * Compact, fast, crisp Landing Page.
 * Strictly maintains 100% language consistency.
 * Features 3D pixelated woman artisan that transforms into Super Woman on click.
 */
export default async function LandingPage() {
  const rawLocale = await getLocale();
  const locale = (rawLocale in microCopy ? rawLocale : "en") as keyof typeof microCopy;
  const copy = microCopy[locale] || microCopy.en;
  const brandLetter = brandLetters[locale] || "O";

  const session = await auth();
  const isAuthed = !!session?.user?.id;
  const userName = session?.user?.name || copy.didiFallback;
  const userRole = (session?.user as { role?: string })?.role;
  const dashboardHref =
    userRole === "ADMIN" ? "/admin" : userRole === "SAKHI" ? "/sakhi-console" : "/app/home";

  const t = await getTranslations("landing");
  const c = await getTranslations("common");
  const authT = await getTranslations("auth");

  const sample = await db.shop.findFirst({
    where: { isLive: true, products: { some: { status: "LIVE" } } },
    select: { slug: true, name: true },
  });

  const steps = [
    {
      icon: <Mic className="h-5 w-5 text-amber-500" />,
      title: t("steps.0.t"),
      desc: t("steps.0.d"),
    },
    {
      icon: <Camera className="h-5 w-5 text-teal-600" />,
      title: t("steps.1.t"),
      desc: t("steps.1.d"),
    },
    {
      icon: <Store className="h-5 w-5 text-indigo-600" />,
      title: t("steps.2.t"),
      desc: t("steps.2.d"),
    },
  ];

  const featureIcons = [
    <Award key="0" className="h-4 w-4 text-teal-600" />,
    <Mic key="1" className="h-4 w-4 text-amber-500" />,
    <TrendingUp key="2" className="h-4 w-4 text-emerald-600" />,
    <Sparkles key="3" className="h-4 w-4 text-indigo-500" />,
    <Camera key="4" className="h-4 w-4 text-teal-600" />,
    <ShieldCheck key="5" className="h-4 w-4 text-blue-600" />,
  ];

  const features = [0, 1, 2, 3, 4, 5].map((i) => ({
    t: t(`features.${i}.t`),
    d: t(`features.${i}.d`),
    icon: featureIcons[i],
  }));

  const stats = [0, 1, 2].map((i) => ({ v: t(`stats.${i}.v`), d: t(`stats.${i}.d`) }));
  const faqs = [0, 1, 2, 3].map((i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`) }));
  const whyRows = [0, 1, 2, 3].map((i) => [
    t(`why.rows.${i}.0`),
    t(`why.rows.${i}.1`),
    t(`why.rows.${i}.2`),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c("appName"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: { "@type": "Offer", price: "0" },
    inLanguage: [locale],
  };

  return (
    <main
      className="weave-bg mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 pb-10 pt-2 sm:pt-4"
      id="main-content"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Sleek, Compact Navigation Header */}
      <header
        className="sticky top-2 z-30 flex items-center justify-between gap-3 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md px-3.5 sm:px-4 py-2 border shadow-xs"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--turmeric)] text-[var(--primary-ink)] font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
            {brandLetter}
          </span>
          <span className="font-extrabold text-base tracking-tight text-[var(--fg)]">
            {c("appName")}
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-5 text-xs font-semibold text-[var(--fg)] opacity-80"
          aria-label="Main Navigation"
        >
          <Link href="#how" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("howTitle")}
          </Link>
          <Link href="#features" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("featuresTitle")}
          </Link>
          <Link href="#why" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("whyTitle")}
          </Link>
          <Link href="#faq" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Language dropdown & Auth CTAs */}
        <div className="flex items-center gap-2">
          <LanguageChip />

          {isAuthed ? (
            <Link
              href={dashboardHref}
              className="flex min-h-[36px] items-center gap-1.5 rounded-full bg-[var(--turmeric)] px-3.5 text-xs font-bold text-[var(--primary-ink)] shadow-xs transition-transform active:scale-95 shrink-0"
            >
              <span>🏪</span>
              <span className="truncate max-w-[100px] sm:max-w-none">{userName}</span>
              <span>→</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-full border bg-[var(--card)] hover:border-[var(--turmeric)] text-xs font-bold shadow-xs transition-colors shrink-0"
                style={{ borderColor: "var(--border)" }}
              >
                {authT("login")}
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-[var(--turmeric)] text-[var(--primary-ink)] text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all shrink-0"
              >
                {t("start")}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 2. Crisp, Short Hero Section with 3D Pixelated Super Woman */}
      <section
        className="relative pt-1 sm:pt-3"
        aria-label={t("title")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column (Copy, CTAs, Audio Accessibility) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-3.5">
            {/* National Initiative Pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs px-3 py-1 border shadow-xs text-[11px] font-semibold text-stone-700 dark:text-stone-300"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{copy.initiativePill}</span>
            </div>

            {/* Main Headline */}
            <h1 className="display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-[1.12]">
              {t("title")}
              <span
                className="block text-2xl sm:text-3xl lg:text-4xl font-bold mt-1"
                style={{ color: "var(--accent)" }}
              >
                {c("tagline")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[44ch] text-sm sm:text-base opacity-80 leading-snug font-normal">
              {t("subtitle")}
            </p>

            {/* Voice Accessibility Listen Button */}
            <div className="flex items-center gap-2">
              <ListenButton text={`${t("title")}. ${c("tagline")}. ${t("subtitle")}`} compact />
              <span className="text-xs opacity-65 font-medium">{copy.listenHint}</span>
            </div>

            {/* Action Buttons & App Download */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto mt-1">
              {isAuthed ? (
                <Link
                  href={dashboardHref}
                  className="flex min-h-[46px] items-center justify-center rounded-xl bg-[var(--turmeric)] px-5 text-sm sm:text-base font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
                >
                  🏪 {copy.continueShop} ({userName}) →
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-[var(--turmeric)] px-5 text-sm sm:text-base font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all text-center"
                >
                  <span>{t("start")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <DownloadAppButton
                label={copy.downloadLabel}
                sublabel={copy.downloadSublabel}
              />
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-2.5 py-0.5 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Mic className="h-3 w-3 text-amber-500" /> {copy.voiceFirst}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-2.5 py-0.5 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Camera className="h-3 w-3 text-teal-600" /> {copy.photoAi}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-2.5 py-0.5 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Languages className="h-3 w-3 text-indigo-600" /> {copy.languagesBadge}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-2.5 py-0.5 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <WifiOff className="h-3 w-3 text-rose-500" /> {copy.offlineBadge}
              </span>
            </div>

            {/* Trust statement */}
            <p className="text-[11px] opacity-65">{t("trust")}</p>
          </div>

          {/* Right Column: Interactive 3D Pixelated Super Woman */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <SuperWomanPixel locale={locale} />
          </div>
        </div>
      </section>

      {/* 3. Compact Impact & Statistics Bar */}
      <Reveal>
        <section aria-label={t("problemTitle")} className="rounded-2xl border bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs p-4 shadow-xs" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
            {stats.map((s, idx) => (
              <div key={idx} className={`flex flex-col items-center sm:items-start text-center sm:text-left ${idx > 0 ? "pt-2 sm:pt-0 sm:pl-4" : ""}`}>
                <p className="display text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
                  {s.v}
                </p>
                <p className="text-xs sm:text-sm opacity-75 font-medium leading-tight mt-0.5">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4. How It Works (3 Compact Steps) */}
      <Reveal>
        <section id="how" aria-label={t("howTitle")} className="scroll-mt-16">
          <div className="flex items-center justify-between mb-3">
            <h2 className="display text-xl sm:text-2xl font-bold tracking-tight">
              {t("howTitle")}
            </h2>
            <span className="text-xs font-semibold opacity-60">100% Voice & Visual</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((s, idx) => (
              <article
                key={s.title}
                className="card-simple p-4 rounded-xl flex flex-col items-start relative hover:border-[var(--turmeric)] transition-colors"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--clay-soft)]/70 shadow-xs">
                    {s.icon}
                  </span>
                  <span className="text-[11px] font-extrabold opacity-40">0{idx + 1}</span>
                </div>
                <h3 className="display text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-xs opacity-75 leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 5. Crisp Ecosystem Features Grid */}
      <Reveal>
        <section id="features" aria-label={t("featuresTitle")} className="scroll-mt-16">
          <div className="flex items-center justify-between mb-3">
            <h2 className="display text-xl sm:text-2xl font-bold tracking-tight">
              {t("featuresTitle")}
            </h2>
            <span className="text-xs font-semibold opacity-60">Made for Rural India</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.t}
                className="card-simple p-3.5 rounded-xl flex items-start gap-3 hover:border-[var(--turmeric)] transition-colors"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--clay-soft)]/80 mt-0.5">
                  {f.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--fg)] leading-snug">{f.t}</h3>
                  <p className="text-xs opacity-75 leading-tight mt-0.5">{f.d}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 6. Why Ojasvini is Different (Compact Table) */}
      <Reveal>
        <section id="why" aria-label={t("whyTitle")} className="scroll-mt-16">
          <h2 className="display text-xl sm:text-2xl font-bold tracking-tight mb-2.5">
            {copy.compareHeader}
          </h2>

          <div
            className="overflow-x-auto rounded-xl border bg-[var(--card)] shadow-xs"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="bg-[var(--clay-soft)]/70 border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="p-2.5 font-bold text-[var(--primary-ink)]" scope="col">
                    {t("whyCols.0")}
                  </th>
                  <th className="p-2.5 font-bold opacity-75" scope="col">
                    {t("whyCols.1")}
                  </th>
                  <th className="p-2.5 font-bold opacity-75" scope="col">
                    {t("whyCols.2")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {whyRows.map((r, i) => (
                  <tr key={i} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                    <td className="p-2.5 font-bold text-[var(--fg)] flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> {r[0]}
                    </td>
                    <td className="p-2.5 opacity-75">{r[1]}</td>
                    <td className="p-2.5 opacity-75">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* 7. Field Experience & Impact Highlight */}
      <Reveal>
        <section
          id="impact"
          aria-label={copy.fieldExperience}
          className="card-simple p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <OjasDidi mood="celebrating" size={54} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                {copy.fieldExperience}
              </span>
              <h2 className="display text-base sm:text-lg font-bold tracking-tight">
                {t("impactLine")}
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="rounded-full bg-[var(--clay-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--turmeric)]">
                  SDG 4: Education
                </span>
                <span className="rounded-full bg-[var(--clay-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--turmeric)]">
                  SDG 8: Decent Work
                </span>
                <span className="rounded-full bg-[var(--clay-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--turmeric)]">
                  SDG 9: Innovation
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/auth/login"
              className="rounded-xl border px-3.5 py-2 text-xs font-bold hover:border-[var(--turmeric)] transition-colors shadow-xs"
              style={{ borderColor: "var(--border)" }}
            >
              {t("demoLogin")}
            </Link>
            {sample && (
              <Link
                href={`/shop/${sample.slug}`}
                className="text-xs font-bold underline hover:opacity-80 transition-opacity"
                style={{ color: "var(--trust)" }}
              >
                {copy.sampleShopLabel} →
              </Link>
            )}
          </div>
        </section>
      </Reveal>

      {/* 8. Frequently Asked Questions (Compact Accordion) */}
      <Reveal>
        <section id="faq" aria-label={copy.faqHeader} className="scroll-mt-16">
          <h2 className="display text-xl sm:text-2xl font-bold tracking-tight mb-2.5">
            {copy.faqHeader}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="card-simple p-3 rounded-xl group cursor-pointer transition-colors hover:border-[var(--turmeric)]"
              >
                <summary className="flex items-center justify-between text-xs sm:text-sm font-bold list-none outline-hidden">
                  <span>{f.q}</span>
                  <span className="text-[10px] transition-transform group-open:rotate-180 opacity-60">
                    ▼
                  </span>
                </summary>
                <p
                  className="mt-2 text-xs opacity-80 leading-relaxed pt-2 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 9. Final Crisp CTA & Language-Consistent Footer */}
      <section
        className="flex flex-col items-center gap-4 text-center pt-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col items-center gap-1 max-w-md">
          <h2 className="display text-xl sm:text-2xl font-bold tracking-tight">
            {copy.startSellingToday}
          </h2>
          <p className="text-xs opacity-75">{copy.freeForever}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-sm">
          <Link
            href={isAuthed ? dashboardHref : "/auth/register"}
            className="flex min-h-[46px] flex-1 w-full items-center justify-center rounded-xl bg-[var(--turmeric)] px-5 text-sm font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
          >
            {isAuthed ? `${copy.dashboardCta} (${userName})` : t("start")}
          </Link>
          <DownloadAppButton
            label={copy.downloadLabel}
            sublabel={copy.downloadSublabel}
            className="w-full sm:w-auto min-h-[46px]"
          />
        </div>

        <footer
          className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 text-[11px] opacity-70 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold">{c("appName")}</span>
            <span>·</span>
            <span>{copy.footerMadeWith}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/app/learn" className="hover:underline">
              {t("featuresTitle")}
            </Link>
            <Link href="/auth/staff" className="hover:underline">
              Sakhi / Staff Login
            </Link>
            <Link href="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link href="/offline" className="hover:underline">
              Offline
            </Link>
          </div>
        </footer>
        <p className="text-[10px] opacity-45 -mt-2">{c("demoHint")}</p>
      </section>
    </main>
  );
}
