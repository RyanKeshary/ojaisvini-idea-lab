"use client";
import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { flushOutbox, onOutboxCount } from "@/lib/offline/sync";
import { toast } from "@/components/ui/Toast";

/**
 * Persistent connectivity banner: offline state, queued count,
 * manual Sync now, and flush-result toasts. Never a dead end.
 */
export function OfflineBanner() {
  const t = useTranslations("pwa");
  const [offline, setOffline] = useState(false);
  const [queued, setQueued] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const onNet = () => {
      const off = !navigator.onLine;
      setOffline(off);
      if (!off) void sync(false);
    };
    setOffline(!navigator.onLine);
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    const msg = (e: MessageEvent) => {
      if (e.data?.type === "ojas-flush-outbox") void sync(false);
    };
    navigator.serviceWorker?.addEventListener("message", msg);
    const unsub = onOutboxCount(setQueued);
    return () => {
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
      navigator.serviceWorker?.removeEventListener("message", msg);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sync(manual: boolean) {
    if (syncing) return;
    setSyncing(true);
    try {
      const { synced, failed } = await flushOutbox();
      if (manual || synced > 0) {
        toast(synced > 0 ? `✓ ${synced} ${t("synced")}` : failed > 0 ? t("syncFailed") : t("synced"));
      }
      if (failed > 0 && synced === 0) toast(t("syncFailed"));
    } finally {
      setSyncing(false);
    }
  }

  if (!offline && queued === 0) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-[var(--indigo)] px-4 py-2 text-base font-bold text-white">
      <CloudOff size={18} aria-hidden />
      <span>
        {offline ? t("offline") : ""}
        {queued > 0 ? ` ${queued} ${t("queued")}.` : ""}
      </span>
      {queued > 0 && (
        <button
          type="button"
          onClick={() => void sync(true)}
          disabled={syncing || offline}
          className="flex min-h-[40px] items-center gap-1 rounded-full bg-white/20 px-3 text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} aria-hidden /> {t("syncNow")}
        </button>
      )}
    </div>
  );
}
