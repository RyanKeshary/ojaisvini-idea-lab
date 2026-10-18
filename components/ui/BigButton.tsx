"use client";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

/** Biggest thing on screen. Min 64px for primary. Press scale 0.97. */
export function BigButton({
  children,
  onClick,
  variant = "primary",
  icon,
  state = "idle",
  ariaLabel,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  icon?: ReactNode;
  state?: "idle" | "loading" | "success";
  ariaLabel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={state === "loading" || disabled}
      className={cn(
        "flex min-h-[58px] sm:min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-base sm:text-lg font-bold disabled:opacity-60 transition-all duration-150 cursor-pointer",
        variant === "primary" && "bg-[var(--turmeric)] text-[var(--primary-ink)] shadow-md hover:opacity-95 hover:shadow-lg",
        variant === "secondary" && "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] shadow-xs hover:border-[var(--turmeric)] hover:shadow-sm",
        variant === "danger" && "bg-[var(--madder)] text-white shadow-md hover:opacity-95",
        variant === "ghost" && "bg-transparent text-[var(--trust)] underline-offset-4 hover:underline"
      )}
    >
      {state === "loading" ? <Loader2 className="animate-spin" aria-hidden /> : state === "success" ? <Check aria-hidden /> : icon}
      <span>{children}</span>
    </motion.button>
  );
}
