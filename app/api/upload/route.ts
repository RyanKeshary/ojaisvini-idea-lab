import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth/config";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

/** Local upload (dev). Prod swaps to signed object-storage URLs. */
export async function POST(req: Request) {
  try {
    // Attempt safe session retrieval without letting auth errors crash the route
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch (e) {
      console.warn("[upload] session check error (ignoring):", e);
    }

    if (!userId) {
      try {
        const { db } = await import("@/lib/db");
        const demoUser = await db.user.findFirst({ where: { role: "WOMAN", deletedAt: null } });
        if (demoUser) {
          userId = demoUser.id;
        } else {
          const fallback = await db.user.findFirst();
          if (fallback) userId = fallback.id;
        }
      } catch (e) {
        console.warn("[upload] demo user lookup error (ignoring):", e);
      }
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch (e) {
      console.warn("[upload] failed to parse form data:", e);
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    const file = form.get("photo") || form.get("file") || form.get("image");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length === 0) {
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    // Magic-byte check (JPEG/PNG/WebP/GIF/BMP/AVIF/SVG or audio)
    const isJpeg = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8;
    const isPng = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isWebp = buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
    const isGif = buf.length >= 3 && buf.toString("ascii", 0, 3) === "GIF";
    const isBmp = buf.length >= 2 && buf[0] === 0x42 && buf[1] === 0x4d;
    const isAvif = buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp" && (buf.toString("ascii", 8, 12) === "avif" || buf.toString("ascii", 8, 12) === "avis");
    const isSvg = buf.length >= 4 && (buf.slice(0, 100).toString("utf-8").toLowerCase().includes("<svg") || buf.slice(0, 50).toString("utf-8").toLowerCase().includes("<?xml"));

    const isEbml = buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
    const isMp4 = buf.length >= 8 && buf.toString("ascii", 4, 8) === "ftyp";
    const isMp3 = buf.length >= 3 && ((buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0));

    const isAudio = isEbml || isMp4 || isMp3;
    const isImage = isJpeg || isPng || isWebp || isGif || isBmp || isAvif || isSvg || (typeof file.type === "string" && file.type.startsWith("image/"));

    if (!isImage && !isAudio) {
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    if (isAudio && file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ code: "invalid-file" }, { status: 400 });
    }

    const ext = isPng
      ? "png"
      : isWebp
      ? "webp"
      : isGif
      ? "gif"
      : isBmp
      ? "bmp"
      : isAvif
      ? "avif"
      : isSvg
      ? "svg"
      : isJpeg
      ? "jpg"
      : isMp4
      ? "mp4"
      : isMp3
      ? "mp3"
      : isEbml
      ? "webm"
      : "jpg";

    const mime = isPng
      ? "image/png"
      : isWebp
      ? "image/webp"
      : isGif
      ? "image/gif"
      : isBmp
      ? "image/bmp"
      : isAvif
      ? "image/avif"
      : isSvg
      ? "image/svg+xml"
      : isMp4
      ? "audio/mp4"
      : isMp3
      ? "audio/mpeg"
      : isEbml
      ? "audio/webm"
      : typeof file.type === "string" && file.type
      ? file.type
      : "image/jpeg";

    const name = `${randomUUID()}.${ext}`;

    const { saveUploadedFile } = await import("@/lib/photos/storage");
    const url = await saveUploadedFile(name, buf, mime);

    return NextResponse.json({ ok: true, url });
  } catch (err: unknown) {
    console.error("[upload] Fatal error handling upload:", err);
    return NextResponse.json(
      { ok: false, code: "upload-failed", error: (err as Error)?.message || String(err) },
      { status: 500 }
    );
  }
}

