/** Display names: first name + village, or pseudonym when anonymous. */
export function displayName(user: { name: string | null; village: string | null }, anon: boolean): string {
  if (anon) return "Sakhi Saheli";
  const first = (user.name || "").trim().split(/\s+/)[0] || "Saheli";
  return user.village ? `${first} · ${user.village}` : first;
}

export function roleBadge(role: string): string | null {
  if (role === "SAKHI" || role === "ADMIN" || role === "MENTOR") return role;
  return null;
}
