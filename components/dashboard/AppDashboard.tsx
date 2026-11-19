"use client";

import { useEffect, useRef } from "react";

interface AppDashboardProps {
  initialTab?: string;
}

export function AppDashboard({ initialTab = "home" }: AppDashboardProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // If an initial tab is provided or location hash changes
    const targetHash = window.location.hash || (initialTab ? `#${initialTab}` : "#home");
    if (frameRef.current) {
      try {
        if (frameRef.current.contentWindow) {
          frameRef.current.contentWindow.location.hash = targetHash;
        }
      } catch {}
    }
  }, [initialTab]);

  return (
    <div className="fixed inset-0 z-30 w-screen h-screen overflow-hidden bg-[var(--bg,#fff)]">
      <iframe
        ref={frameRef}
        src={`/dashboard-embed/index.html${initialTab ? `#${initialTab}` : "#home"}`}
        title="Ojasvini Seller Dashboard"
        className="w-full h-full border-0 select-none"
        allow="microphone; camera; clipboard-write;"
      />
    </div>
  );
}
