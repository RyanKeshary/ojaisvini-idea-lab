import { ImageResponse } from "next/og";

// Edge runtime: the node build of next/og mis-joins its bundled font path on
// Windows (ERR_INVALID_URL). The edge build resolves it correctly. Prisma is
// unreachable here, so shop data comes from our public stats API instead.
export const runtime = "edge";

const fontCache = new Map<string, ArrayBuffer>();

/**
 * Subset Mukta (latin + Devanagari) to exactly the glyphs on this card via
 * the legacy css API (single ttf). Edge-safe (fetch only). Cached per set.
 */
async function subsetFont(text: string): Promise<ArrayBuffer | null> {
  const key = [...new Set(text)].sort().join("");
  if (fontCache.has(key)) return fontCache.get(key)!;
  try {
    const css = await fetch(`https://fonts.googleapis.com/css?family=Mukta:700&text=${encodeURIComponent(key)}`, {
      headers: { "User-Agent": "Mozilla/4.0" },
      signal: AbortSignal.timeout(8000),
    }).then((r) => {
      if (!r.ok) throw new Error("font-css");
      return r.text();
    });
    const m = css.match(/url\((https:[^)]+?\.ttf)\)/);
    if (!m) return null;
    const buf = await fetch(m[1], { signal: AbortSignal.timeout(8000) }).then((r) => {
      if (!r.ok) throw new Error("font-dl");
      return r.arrayBuffer();
    });
    fontCache.set(key, buf);
    return buf;
  } catch {
    return null;
  }
}

/** OG image: shop name + live product count (storefront sharing). */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let name = "Ojasvini";
  let liveCount = 0;
  try {
    const stats = await fetch(new URL(`/api/shops/${slug}/stats`, req.url), {
      signal: AbortSignal.timeout(8000),
    }).then((r) => (r.ok ? r.json() : null)) as { name?: string; liveCount?: number } | null;
    if (stats) {
      name = stats.name ?? name;
      liveCount = stats.liveCount ?? 0;
    }
  } catch {}
  const sub = `${liveCount} product${liveCount === 1 ? "" : "s"} · Ojasvini`;
  const face = await subsetFont(name + sub);

  const card = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFF9F0",
        fontFamily: face ? "OG" : "sans-serif",
      }}
    >
      <div style={{ width: 120, height: 120, borderRadius: 60, background: "#F2A900" }} />
      <div style={{ fontSize: 64, fontWeight: 700, color: "#2A1B2E", marginTop: 24 }}>{name}</div>
      <div style={{ fontSize: 32, color: "#C4304F", marginTop: 8 }}>{sub}</div>
    </div>
  );

  try {
    return new ImageResponse(card, {
      width: 1200,
      height: 630,
      ...(face ? { fonts: [{ name: "OG", data: face, weight: 700 as const, style: "normal" as const }] } : {}),
    });
  } catch (e) {
    console.error("[og] render failed", e);
    return new Response(
      "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect width='1200' height='630' fill='#FFF9F0'/></svg>",
      { headers: { "content-type": "image/svg+xml" } }
    );
  }
}
