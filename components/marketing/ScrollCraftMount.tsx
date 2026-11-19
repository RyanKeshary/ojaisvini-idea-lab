"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root?: Document | Element | string, opts?: { lerp?: number }) => {
        destroy: () => void;
      };
      reduce?: boolean;
    };
  }
}

/**
 * Mounts the scroll-craft engine over the landing page, and tears it down on
 * unmount. mount() registers window listeners plus two self-rescheduling rAF
 * loops, so a Next client navigation without destroy() would leave the old
 * instance running for the life of the tab.
 *
 * The import is dynamic on purpose: scrollcraft.js is a standalone-page IIFE
 * that reads `window` at module scope, so a static import would execute it
 * during SSR of this client component and crash the server render.
 *
 * If the engine never arrives (bundle error, blocked script), `sc-dead` on
 * <html> forces every staged element visible — without it the engine's CSS
 * would leave the page at opacity 0 forever.
 */
export function ScrollCraftMount() {
  useEffect(() => {
    let api: { destroy: () => void } | null = null;
    let cancelled = false;
    import("@/components/marketing/engineLoader")
      .then(() => {
        if (cancelled) return;
        if (!window.ScrollCraft) throw new Error("ScrollCraft unavailable");
        api = window.ScrollCraft.mount(document);
      })
      .catch(() => {
        document.documentElement.classList.add("sc-dead");
      });
    return () => {
      cancelled = true;
      api?.destroy();
      document.documentElement.classList.remove("sc-dead");
    };
  }, []);

  return null;
}
