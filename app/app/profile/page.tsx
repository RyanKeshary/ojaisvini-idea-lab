"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { ListenButton } from "@/components/voice/ListenButton";
import { maskPhone } from "@/lib/utils";
import { usePrefs } from "@/lib/store/prefs";
import { useTranslations as useT } from "next-intl";

const LINKS = [
  { href: "/app/learn", icon: "📚", key: "learn" },
  { href: "/app/products", icon: "🧺", key: "products" },
  { href: "/app/orders", icon: "📦", key: "orders" },
  { href: "/app/schemes", icon: "🏛️", key: "schemes" },
  { href: "/app/community", icon: "💬", key: "community" },
  { href: "/app/assistant", icon: "🤖", key: "assistant" },
  { href: "/app/payouts", icon: "💰", key: "payouts" },
  { href: "/app/notifications", icon: "🔔", key: "notifications" },
];

/** Low-data mode toggle (persisted; kills decorative animation via CSS). */
function DataSaverToggle() {
  const tp = useT("pwa");
  const dataSaver = usePrefs((s) => s.dataSaver);
  const setDataSaver = usePrefs((s) => s.setDataSaver);
  return (
    <label className="flex min-h-[64px] cursor-pointer items-center justify-between gap-3 rounded-[20px] border bg-[var(--card)] px-5" style={{ borderColor: "var(--border)" }}>
      <span>
        <span className="block text-base font-bold">{tp("dataSaver")}</span>
        <span className="block text-sm opacity-70">{tp("dataSaverHint")}</span>
      </span>
      <input
        type="checkbox"
        checked={dataSaver}
        onChange={(e) => setDataSaver(e.target.checked)}
        aria-label={tp("dataSaver")}
        className="h-7 w-7 accent-[var(--turmeric)]"
      />
    </label>
  );
}

/** Profile + hub to every section (no dead ends anywhere in the app). */
export default function ProfilePage() {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const { data } = useSession();
  const phone = (data?.user as { phone?: string } | undefined)?.phone ?? "";
  const name = data?.user?.name || "";
  const role = (data?.user as { role?: string } | undefined)?.role ?? "WOMAN";
  const labels: Record<string, string> = {
    learn: tn("learn"),
    products: "Products",
    orders: tn("orders"),
    schemes: "Schemes",
    community: "Community",
    assistant: "Sakhi Didi",
    payouts: "Payouts",
    notifications: "Notifications",
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{name || "Profile"}</h1>
      <div className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <p className="text-lg">{phone ? maskPhone(phone) : ""}</p>
        <p className="text-sm opacity-70">Role: {role}</p>
      </div>
      <nav aria-label="More sections" className="grid grid-cols-2 gap-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex min-h-[64px] items-center gap-3 rounded-[20px] border bg-[var(--card)] px-4 text-base font-bold"
            style={{ borderColor: "var(--border)" }}
          >
            <span aria-hidden className="text-2xl">{l.icon}</span>
            {labels[l.key]}
          </Link>
        ))}
      </nav>
      <LanguageChip />
      <DataSaverToggle />
      <ListenButton text={`${name}. ${role}.`} />
      <BigButton variant="secondary" onClick={() => void signOut({ callbackUrl: "/" })}>
        {t("logout")}
      </BigButton>
    </main>
  );
}
