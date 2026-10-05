import { db } from "@/lib/db";

function slugifyLatin(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Ensure the seller has a live shop. Slug from name, else phone-based. */
export async function getOrCreateShop(userId: string) {
  const existing = await db.shop.findFirst({ where: { ownerId: userId } });
  if (existing) return existing;
  const user = await db.user.findUnique({ where: { id: userId } });
  const baseName = (user?.name || "").trim() || "Meri Dukaan";
  const hasShopWord = /dukaan|shop|store|दुकान/i.test(baseName);
  const shopName = hasShopWord
    ? baseName
    : /[a-zA-Z]/.test(baseName)
      ? `${baseName}'s Dukaan`
      : baseName + (user?.locale === "mr" ? "चं दुकान" : user?.locale === "hi" ? " की दुकान" : " Dukaan");
  let slug = slugifyLatin(shopName);
  if (!slug) {
    const digits = (user?.phone || "shop").replace(/\D/g, "").slice(-6) || "shop";
    slug = `dukaan-${digits}`;
  }
  // Uniqueness with short suffix.
  let candidate = slug;
  for (let i = 0; i < 5; i++) {
    const taken = await db.shop.findUnique({ where: { slug: candidate } });
    if (!taken) break;
    candidate = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return db.shop.create({
    data: {
      ownerId: userId,
      slug: candidate,
      name: shopName,
      theme: "turmeric",
      bio: "",
      isLive: true,
    },
  });
}
