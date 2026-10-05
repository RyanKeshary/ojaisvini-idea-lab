"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Floating Sakhi Didi entry. Hidden on the assistant page itself (would cover the input bar). */
export function AssistantFab() {
  const path = usePathname();
  if (path === "/app/assistant") return null;
  return (
    <Link
      href="/app/assistant"
      aria-label="Ask Sakhi Didi"
      className="fixed bottom-24 right-4 z-40 grid h-16 w-16 place-items-center rounded-full text-3xl lg:bottom-8 lg:right-8"
      style={{ background: "var(--indigo)", boxShadow: "var(--shadow-float)" }}
    >
      <span aria-hidden>💬</span>
    </Link>
  );
}
