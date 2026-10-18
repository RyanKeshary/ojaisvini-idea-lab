"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Package, Mic, LayoutDashboard, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageChip } from "@/components/ui/LanguageChip";

/** Desktop left side rail (≥1024px). */
export function SideRail() {
  const t = useTranslations("nav");
  const td = useTranslations("dashboard");
  const path = usePathname();
  const items = [
    { href: "/app/home", label: t("home"), icon: <Home aria-hidden /> },
    { href: "/app/learn", label: t("learn"), icon: <GraduationCap aria-hidden /> },
    { href: "/app/create", label: t("create"), icon: <Mic aria-hidden /> },
    { href: "/app/orders", label: t("orders"), icon: <Package aria-hidden /> },
    { href: "/app/dashboard", label: td("title"), icon: <LayoutDashboard aria-hidden /> },
    { href: "/app/profile", label: t("more"), icon: <User aria-hidden /> },
  ];
  return (
    <nav
      aria-label="Primary"
      className="hidden w-64 shrink-0 flex-col gap-1.5 border-r p-5 lg:flex bg-white/40 dark:bg-stone-900/30 backdrop-blur-xs"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2.5 px-3 py-4 mb-2">
        <span className="h-3 w-3 rounded-full bg-[var(--turmeric)] shadow-xs animate-pulse" />
        <p className="display text-2xl font-bold tracking-tight text-[var(--fg)]">Ojasvini</p>
      </div>
      {items.map((it) => {
        const isActive = path === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[50px] items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-all duration-150 ${
              isActive
                ? "bg-[var(--clay-soft)]/75 text-[var(--turmeric)] shadow-xs"
                : "text-[var(--fg)] opacity-70 hover:opacity-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            }`}
          >
            <span aria-hidden className={`text-lg transition-transform ${isActive ? "scale-110" : ""}`}>
              {it.icon}
            </span>
            <span>{it.label}</span>
          </Link>
        );
      })}

      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <LanguageChip />
      </div>
    </nav>
  );
}
