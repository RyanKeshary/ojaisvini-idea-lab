"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Home,
  Mic,
  Package,
  LayoutDashboard,
  GraduationCap,
  Store,
  Users,
  Landmark,
  Bell,
  Wallet,
  User,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { describeNotification, type Notification } from "@/lib/notifications";

type RailLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  badge?: number;
};

function RailItem({ it, path }: { it: RailLink; path: string }) {
  const isActive = path === it.href || path.startsWith(it.href + "/");
  const Icon = it.icon;
  return (
    <Link
      href={it.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all duration-150 ${
        isActive
          ? "bg-[var(--clay-soft)]/75 text-[var(--turmeric)] shadow-xs"
          : "text-[var(--fg)] opacity-70 hover:opacity-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{it.label}</span>
      {it.badge ? (
        <span
          className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--madder)] px-1.5 text-[10px] font-black text-[var(--primary-ink)]"
          aria-label={`${it.badge}`}
        >
          {it.badge > 99 ? "99+" : it.badge}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Desktop left side rail (≥1024px).
 * Profile on top · primary links · divider · less-used pages ·
 * bottom: Vercel-style notification nudge, Ask Ojas, language.
 * No branding here by design — the product name lives in the top bar.
 */
export function SideRail() {
  const t = useTranslations("nav");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tcm = useTranslations("community");
  const tn = useTranslations("notifications");
  const path = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name || "";

  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<Notification | null>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        if (!r?.ok) return;
        setUnread(r.unread);
        setLatest(r.notifications.find((n: Notification) => !n.read) ?? null);
      })
      .catch(() => {});
  }, []);

  const primary: RailLink[] = [
    { href: "/app/home", label: t("home"), icon: Home },
    { href: "/app/create", label: t("create"), icon: Mic },
    { href: "/app/orders", label: t("orders"), icon: Package },
    { href: "/app/dashboard", label: td("title"), icon: LayoutDashboard },
  ];
  const secondary: RailLink[] = [
    { href: "/app/learn", label: t("learn"), icon: GraduationCap },
    { href: "/app/products", label: td("products"), icon: Store },
    { href: "/app/community", label: tcm("title"), icon: Users },
    { href: "/app/schemes", label: td("schemes"), icon: Landmark },
    { href: "/app/notifications", label: tn("title"), icon: Bell, badge: unread },
    { href: "/app/payouts", label: td("payouts"), icon: Wallet },
  ];

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r p-4 lg:flex bg-white/40 dark:bg-stone-900/30 backdrop-blur-xs"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Profile management — always the first thing in the rail. */}
      <Link
        href="/app/profile"
        className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--turmeric)] text-sm font-black text-[var(--primary-ink)]">
          {(name || tc("appName")).charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--fg)]">
            {name || tc("appName")}
          </span>
          <span className="block text-xs text-[var(--fg)] opacity-60">{t("profile")}</span>
        </span>
        <User className="h-4 w-4 shrink-0 text-[var(--fg)] opacity-40" aria-hidden />
      </Link>

      <div className="flex flex-col gap-0.5">
        {primary.map((it) => (
          <RailItem key={it.href} it={it} path={path} />
        ))}
      </div>

      <hr className="my-2.5 border-[var(--border)]" />

      <div className="flex flex-col gap-0.5">
        {secondary.map((it) => (
          <RailItem key={it.href} it={it} path={path} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        {/* Vercel-style nudge: latest unread, bottom-left, one line. */}
        {unread > 0 && latest && (
          <Link
            href="/app/notifications"
            className="nudge-in flex items-center gap-2 rounded-lg border bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--fg)] shadow-md transition-shadow hover:shadow-lg"
            style={{ borderColor: "var(--border)" }}
          >
            <Bell className="h-3.5 w-3.5 shrink-0 text-[var(--turmeric)]" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{describeNotification(latest)}</span>
          </Link>
        )}

        <Link
          href="/app/assistant"
          className="flex min-h-[42px] items-center gap-3 rounded-xl border border-dashed px-3 text-sm font-bold text-[var(--fg)] transition-all hover:border-[var(--turmeric)] hover:shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--turmeric)]" aria-hidden />
          <span className="flex-1">{tc("askOjas")}</span>
        </Link>

        <div className="border-t pt-2" style={{ borderColor: "var(--border)" }}>
          <LanguageChip />
        </div>
      </div>
    </nav>
  );
}
