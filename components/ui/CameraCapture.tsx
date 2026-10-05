"use client";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";

/** Camera capture with guide overlay + brightness coaching. Phase 1: file input + canvas luminance check. */
export function CameraCapture({ onPhoto }: { onPhoto?: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handle(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    // luminance check
    try {
      const bmp = await createImageBitmap(file);
      const c = document.createElement("canvas");
      c.width = 32; c.height = 32;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0, 32, 32);
      const d = ctx.getImageData(0, 0, 32, 32).data;
      let lum = 0;
      for (let i = 0; i < d.length; i += 4) lum += (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      lum /= 1024;
      setTip(lum < 0.28 ? "Thoda ujala badhaiye — light peeche se aani chahiye." : null);
    } catch {
      setTip(null);
    }
    onPhoto?.(url);
  }

  return (
    <div className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label="Take product photo"
        className="grid min-h-[160px] w-full place-items-center rounded-[12px] border-2 border-dashed"
        style={{ borderColor: "var(--mist)" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Product preview" className="max-h-56 rounded-[12px] object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-base font-bold opacity-70">
            <Camera aria-hidden size={32} />
            Photo lo
          </span>
        )}
      </button>
      {/* guide overlay hint */}
      <p className="mt-2 text-sm opacity-70">Guide: samaan beech mein rakhein, light peeche se.</p>
      {tip && <p role="alert" className="mt-1 text-sm font-bold" style={{ color: "var(--madder)" }}>{tip}</p>}
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handle(f); }}
      />
    </div>
  );
}
