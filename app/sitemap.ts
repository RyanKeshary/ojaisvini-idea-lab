import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ojaisvini.vercel.app";

/** Static public routes. Shop pages are dynamic (no cookie) — crawled via links. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/auth/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/auth/register`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/offline`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
