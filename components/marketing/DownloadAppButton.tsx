"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, QrCode, Share2, Check, X, ArrowUpRight } from "lucide-react";
import QRCode from "qrcode";
import { canInstall, isIosSafari, isStandalone, onInstallReady, promptInstall } from "@/lib/pwa/install";

interface DownloadAppButtonProps {
  label?: string;
  sublabel?: string;
  className?: string;
}

export function DownloadAppButton({
  label = "Download App",
  sublabel = "Install on your phone",
  className = "",
}: DownloadAppButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isIos, setIsIos] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setInstallable(canInstall());
    setIsIos(isIosSafari());

    const isMobile =
      typeof window !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768);
    setIsMobileDevice(isMobile);

    const cleanup = onInstallReady(() => {
      setInstallable(true);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    if (modalOpen && !qrDataUrl && typeof window !== "undefined") {
      const url = window.location.origin;
      QRCode.toDataURL(url, {
        width: 260,
        margin: 2,
        color: {
          dark: "#143731",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [modalOpen, qrDataUrl]);

  async function handleDownloadClick() {
    // If native install prompt is directly available on this device (e.g. Android phone)
    if (installable) {
      try {
        const accepted = await promptInstall();
        if (accepted) {
          setInstalled(true);
          return;
        }
      } catch {
        // Fallback to modal if prompt fails
      }
    }

    // Otherwise open the install / download guidance modal
    setModalOpen(true);
  }

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleShareWhatsapp() {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`Open and install Ojasvini app on your phone: ${window.location.origin}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  }

  function handleDownloadLauncher() {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Ojasvini App</title>
  <meta name="theme-color" content="#143731">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta http-equiv="refresh" content="0; url=${origin}/">
  <script>window.location.href = "${origin}/";</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#E4F1EE;color:#143731;">
  <h2>Opening Ojasvini...</h2>
  <p><a href="${origin}/" style="color:#007A78;font-weight:bold;">Click here if not redirected automatically</a></p>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ojasvini-app-launcher.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  if (installed) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 ${className}`}>
        <Check className="h-4 w-4 text-emerald-600" />
        <span>App Installed on this device</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownloadClick}
        className={`group relative flex min-h-[52px] sm:min-h-[58px] items-center justify-center gap-2.5 rounded-2xl border-2 bg-[var(--card)] px-5 py-3 text-base sm:text-lg font-bold text-[var(--fg)] shadow-sm hover:border-[var(--turmeric)] hover:shadow-md active:scale-98 transition-all ${className}`}
        style={{ borderColor: "var(--border)" }}
        aria-label="Download Ojasvini App on Phone"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--clay-soft)] text-[var(--turmeric)] group-hover:bg-[var(--turmeric)] group-hover:text-[var(--primary-ink)] transition-colors">
          <Download className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-y-0.5" />
        </span>
        <div className="flex flex-col text-left">
          <span className="leading-tight">{label}</span>
          {sublabel && <span className="text-[11px] sm:text-xs font-normal opacity-70 leading-tight">{sublabel}</span>}
        </div>
      </button>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-[var(--bg)] border shadow-2xl p-6 sm:p-7 overflow-hidden text-[var(--fg)] max-h-[90vh] overflow-y-auto"
            style={{ borderColor: "var(--border)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-modal-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[var(--card)] border hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              style={{ borderColor: "var(--border)" }}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 opacity-75" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--turmeric)] text-[var(--primary-ink)] text-2xl font-bold shadow-sm">
                📲
              </span>
              <div>
                <h3 id="download-modal-title" className="display text-xl sm:text-2xl font-bold leading-tight">
                  Download Ojasvini App
                </h3>
                <p className="text-xs sm:text-sm opacity-70">
                  फ़ोन पर ऐप इंस्टॉल करें · 100% Free
                </p>
              </div>
            </div>

            {/* Mobile iOS safari scenario */}
            {isMobileDevice && isIos ? (
              <div className="flex flex-col gap-4 text-sm mt-3">
                <div className="rounded-2xl border bg-[var(--card)] p-4 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
                  <p className="font-semibold text-base">iPhone / iPad steps:</p>
                  <ol className="flex flex-col gap-2.5 opacity-90">
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">1</span>
                      <span>Tap the <strong>Share button</strong> (📤) at the bottom of Safari.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">2</span>
                      <span>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (➕).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">3</span>
                      <span>Tap <strong>Add</strong> in the top-right corner.</span>
                    </li>
                  </ol>
                </div>
                <p className="text-xs opacity-75 text-center">
                  Ojasvini will be installed as an offline-ready app directly on your phone home screen!
                </p>
              </div>
            ) : isMobileDevice && !installable ? (
              <div className="flex flex-col gap-4 text-sm mt-3">
                <div className="rounded-2xl border bg-[var(--card)] p-4 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
                  <p className="font-semibold text-base">Android Chrome steps:</p>
                  <ol className="flex flex-col gap-2.5 opacity-90">
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">1</span>
                      <span>Tap the <strong>three dots</strong> (⋮) in the top right corner of Chrome.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">2</span>
                      <span>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--clay-soft)] font-bold text-xs">3</span>
                      <span>Confirm <strong>Install</strong>.</span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Laptop / Desktop scenario */
              <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm opacity-80 leading-relaxed">
                  Scan this QR code with your phone camera to download & install the app directly on your mobile device:
                </p>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border shadow-inner">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="Scan to install Ojasvini App on phone" className="h-48 w-48 rounded-lg" />
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center bg-stone-100 rounded-lg text-stone-400">
                      <QrCode className="h-10 w-10 animate-pulse" />
                    </div>
                  )}
                  <span className="text-xs text-stone-600 mt-2 font-medium flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" /> Point phone camera at code
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsapp}
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-98 transition-all shadow-sm"
                  >
                    <Share2 className="h-4 w-4" /> Send App Link via WhatsApp
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border bg-[var(--card)] text-xs font-semibold hover:border-[var(--turmeric)] active:scale-98 transition-all"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                      <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadLauncher}
                      className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border bg-[var(--card)] text-xs font-semibold hover:border-[var(--turmeric)] active:scale-98 transition-all"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Launcher</span>
                    </button>
                  </div>

                  {installable && (
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await promptInstall();
                        if (ok) {
                          setInstalled(true);
                          setModalOpen(false);
                        }
                      }}
                      className="mt-1 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--turmeric)] text-[var(--primary-ink)] font-bold text-sm shadow-sm hover:opacity-90 active:scale-98 transition-all"
                    >
                      <span>Install on this computer</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t text-center text-xs opacity-60" style={{ borderColor: "var(--border)" }}>
              ⚡ Works 100% offline · No app store login required · Fast & lightweight (&lt;2MB)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
