"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Universal opening animation for all pages in the website.
 * Smoothly scales & fades the incoming page into view on route changes.
 */
export default function RootTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="universal-page-enter">
      {children}
    </div>
  );
}
