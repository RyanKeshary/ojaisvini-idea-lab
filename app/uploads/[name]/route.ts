import { NextResponse } from "next/server";
import { getUploadedFile } from "@/lib/photos/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> | { name: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const name = resolvedParams.name;
    if (!name) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const file = await getUploadedFile(name);
    if (!file) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new Response(new Uint8Array(file.buf), {
      status: 200,
      headers: {
        "Content-Type": file.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[uploads] Failed to serve file:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
