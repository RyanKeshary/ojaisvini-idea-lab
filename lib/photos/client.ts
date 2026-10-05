"use client";

/** Client photo pipeline: downscale to ≤1024px + JPEG re-encode (strips EXIF/GPS).
 *  Keeps each upload well under ~150KB for 2G-class networks and Groq vision. */

export async function compressPhoto(file: File, maxDim = 1024): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.7));
  if (!blob) throw new Error("compress-failed");
  return blob;
}

/** Mean luminance 0..1 for the "too dark" voice-coaching tip. */
export async function luminance(blob: Blob): Promise<number> {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, 32, 32);
  bmp.close();
  const d = ctx.getImageData(0, 0, 32, 32).data;
  let lum = 0;
  for (let i = 0; i < d.length; i += 4) lum += (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
  return lum / 1024;
}

export async function uploadPhoto(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("photo", blob, "photo.jpg");
  const r = await fetch("/api/upload", { method: "POST", body: form });
  const j = (await r.json()) as { ok?: boolean; url?: string };
  if (!r.ok || !j.url) throw new Error("upload-failed");
  return j.url;
}
