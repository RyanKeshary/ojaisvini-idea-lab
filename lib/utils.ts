import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format INR with en-IN grouping. */
export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Mask phone: 98••••1234 */
export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "").slice(-10);
  if (d.length < 10) return "••••";
  return `${d.slice(0, 2)}••••${d.slice(6)}`;
}
