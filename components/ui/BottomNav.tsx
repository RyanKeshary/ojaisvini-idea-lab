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
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/85 dark:bg-[#101e1c]/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(17,38,35,0.05)]"
      style={{ borderColor: "var(--border)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((it) => {
          const isActive = path === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={it.label}
                className="relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all duration-150"
                style={{
                  color: isActive ? "var(--turmeric)" : "var(--fg)",
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {it.fab ? (
                  <span
                    className="grid h-13 w-13 -translate-y-3 place-items-center rounded-full text-xl text-[var(--primary-ink)] shadow-md hover:shadow-lg active:scale-95 transition-all"
                    style={{ background: "var(--turmeric)", boxShadow: "var(--shadow-float)" }}
                    aria-hidden
                  >
                    {it.icon}
                  </span>
                ) : (
                  <span className="text-xl" aria-hidden>
                    {it.icon}
                  </span>
                )}
                <span className="truncate max-w-[56px] text-center">{it.label}</span>
                {isActive && !it.fab && (
                  <span
                    className="absolute bottom-1.5 h-1 w-1 rounded-full"
                    style={{ background: "var(--turmeric)" }}
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
