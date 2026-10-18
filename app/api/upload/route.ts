import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth/config";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_BYTES = 2 * 1024 * 1024; // 60s voice note
const ALLOWED_IMG = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_AUDIO = new Set(["audio/webm", "audio/mp4", "audio/mpeg"]);

/** Local upload (dev). Prod swaps to signed object-storage URLs. */
export async function POST(req: Request) {
  const session = await auth();
  let userId = session?.user?.id;
  if (!userId) {
    const { db } = await import("@/lib/db");
    const demoUser = await db.user.findFirst({ where: { role: "WOMAN" } });
    if (demoUser) userId = demoUser.id;
    else {
      const u = await db.user.create({ data: { phone: "9876543210", name: "Sita Didi", role: "WOMAN" } });
      userId = u.id;
    }
  }
  if (!userId) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }
  const file = form.get("photo");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());

  // Magic-byte check (JPEG/PNG/WebP or audio)
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isWebp = buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  const isEbml = buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
  const isMp4 = buf.toString("ascii", 4, 8) === "ftyp";
  const isMp3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;

  if (!isJpeg && !isPng && !isWebp && !isEbml && !isMp4 && !isMp3) {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }

  const isAudio = isEbml || isMp4 || isMp3;
  if (isAudio && file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ code: "invalid-file" }, { status: 400 });
  }

  const ext = isPng ? "png" : isWebp ? "webp" : isJpeg ? "jpg" : isMp4 ? "mp4" : isMp3 ? "mp3" : "webm";
  const name = `${randomUUID()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buf);
  // NOTE: client compresses to ≤1600px via canvas (re-encode strips EXIF/GPS).
  // Prod swaps this whole route for signed object-storage URLs. Local disk
  // also means `next start` only serves files present at boot (it snapshots
  // public/); `next dev` and object storage don't have this quirk.
  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
