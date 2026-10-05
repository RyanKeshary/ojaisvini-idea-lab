"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Package, Mic, LayoutDashboard, User } from "lucide-react";
import { useTranslations } from "next-intl";

/** Desktop left side rail (≥1024px). */
export function SideRail() {
  const t = useTranslations("nav");
  const path = usePathname();
  const items = [
    { href: "/app/home", label: t("home"), icon: <Home aria-hidden /> },
    { href: "/app/learn", label: t("learn"), icon: <GraduationCap aria-hidden /> },
    { href: "/app/create", label: t("create"), icon: <Mic aria-hidden /> },
    { href: "/app/orders", label: t("orders"), icon: <Package aria-hidden /> },
    { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard aria-hidden /> },
    { href: "/app/profile", label: t("more"), icon: <User aria-hidden /> },
  ];
  return (
    <nav aria-label="Primary" className="hidden w-60 shrink-0 flex-col gap-1 border-r p-4 lg:flex" style={{ borderColor: "var(--border)" }}>
      <p className="display px-2 py-3 text-2xl font-bold">Ojasvini</p>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={path === it.href ? "page" : undefined}
          className="flex min-h-[56px] items-center gap-3 rounded-[12px] px-3 text-base font-bold"
          style={{ background: path === it.href ? "var(--clay-soft)" : "transparent" }}
        >
          <span aria-hidden className="text-xl">{it.icon}</span>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
