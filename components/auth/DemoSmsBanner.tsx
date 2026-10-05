"use client";
import { MessageSquareText } from "lucide-react";

/** Fake on-screen "SMS" for demo mode + always-visible demo OTP hint. */
export function DemoSmsBanner({ code, hint }: { code?: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {code && (
        <div role="status" className="flex items-start gap-3 rounded-[20px] bg-[var(--card)] p-4" style={{ boxShadow: "var(--shadow-float)" }}>
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)]">
            <MessageSquareText size={20} />
          </span>
          <p className="text-base">
            <span className="font-bold">SMS · Ojasvini: </span>
            code <span className="font-bold tracking-widest">{code}</span>. Kisi se share na karein.
          </p>
        </div>
      )}
      <p className="inline-block self-start rounded-full bg-[var(--clay-soft)] px-3 py-1 text-sm font-bold">{hint}</p>
    </div>
  );
}
