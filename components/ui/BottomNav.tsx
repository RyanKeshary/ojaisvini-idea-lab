"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Package, Mic, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

/** Mobile bottom nav: Home, Learn, centre orb FAB, Orders, More. */
export function BottomNav() {
  const t = useTranslations("nav");
  const path = usePathname();
  const items = [
    { href: "/app/home", label: t("home"), icon: <Home aria-hidden /> },
    { href: "/app/learn", label: t("learn"), icon: <GraduationCap aria-hidden /> },
    { href: "/app/create", label: t("create"), icon: <Mic aria-hidden />, fab: true },
    { href: "/app/orders", label: t("orders"), icon: <Package aria-hidden /> },
    { href: "/app/profile", label: t("more"), icon: <MoreHorizontal aria-hidden /> },
  ];
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--card)] pb-[env(safe-area-inset-bottom)]" style={{ borderColor: "var(--border)" }}>
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={path === it.href ? "page" : undefined}
              aria-label={it.label}
              className="flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-xs font-bold"
              style={{ color: path === it.href ? "var(--madder)" : "var(--fg)" }}
            >
              {it.fab ? (
                <span className="grid h-14 w-14 -translate-y-3 place-items-center rounded-full text-2xl text-[var(--primary-ink)]" style={{ background: "var(--turmeric)", boxShadow: "var(--shadow-float)" }} aria-hidden>
                  {it.icon}
                </span>
              ) : (
                <span className="text-2xl" aria-hidden>{it.icon}</span>
              )}
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
