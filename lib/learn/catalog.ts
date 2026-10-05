/** Learning catalog types. Localized content lives in content.ts. */

export type Locale3 = "hi" | "mr" | "en";

export type QuizOption = { icon: string; label: string };
export type Quiz = { q: string; options: QuizOption[]; answer: 0 | 1 | 2 };
export type TaskKind = "upi" | "whatsapp" | "photo" | "none";
export type LessonContent = {
  title: string;
  cards: { icon: string; text: string }[];
  task: { kind: TaskKind; instruction: string };
  quiz: Quiz;
};

export type JourneyMeta = { id: string; icon: string; lessons: string[] };

export const JOURNEYS: JourneyMeta[] = [
  { id: "phone", icon: "📱", lessons: ["phone-1", "phone-2", "phone-3"] },
  { id: "upi", icon: "💸", lessons: ["upi-1", "upi-2", "upi-3"] },
  { id: "whatsapp", icon: "💬", lessons: ["whatsapp-1", "whatsapp-2", "whatsapp-3"] },
  { id: "photo", icon: "📷", lessons: ["photo-1", "photo-2", "photo-3"] },
  { id: "pricing", icon: "💰", lessons: ["pricing-1", "pricing-2", "pricing-3"] },
  { id: "packing", icon: "📦", lessons: ["packing-1", "packing-2", "packing-3"] },
  { id: "safety", icon: "🛡️", lessons: ["safety-1", "safety-2", "safety-3"] },
  { id: "schemes", icon: "🏛️", lessons: ["schemes-1", "schemes-2", "schemes-3"] },
];

/** Badge earned by completing the lesson (plus "first-step" for the very first). */
export const LESSON_BADGE: Record<string, string> = {
  "phone-3": "phone-ready",
  "upi-2": "upi-ready",
  "whatsapp-2": "whatsapp-ready",
  "photo-2": "photo-pro",
  "pricing-2": "pricing-pro",
  "packing-2": "pack-pro",
  "safety-2": "safe-seller",
  "schemes-2": "scheme-finder",
};

export const BADGES: Record<string, { icon: string }> = {
  "first-step": { icon: "🌱" },
  "phone-ready": { icon: "📱" },
  "upi-ready": { icon: "💸" },
  "whatsapp-ready": { icon: "💬" },
  "photo-pro": { icon: "📷" },
  "pricing-pro": { icon: "💰" },
  "pack-pro": { icon: "📦" },
  "safe-seller": { icon: "🛡️" },
  "scheme-finder": { icon: "🏛️" },
};
