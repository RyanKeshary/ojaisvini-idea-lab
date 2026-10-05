import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const session = req.auth;
  const authed = !!session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  const needsAuth =
    path.startsWith("/app") || path.startsWith("/sakhi-console") || path.startsWith("/admin");

  if (needsAuth && !authed) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if ((path === "/auth/login" || path === "/auth/register") && authed) {
    const dest = role === "ADMIN" ? "/admin" : role === "SAKHI" ? "/sakhi-console" : "/app/home";
    return NextResponse.redirect(new URL(dest, req.url));
  }
  if (path.startsWith("/admin") && authed && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/app/home", req.url));
  }
  if (path.startsWith("/sakhi-console") && authed && !["SAKHI", "ADMIN", "MENTOR"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/app/home", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/sakhi-console/:path*", "/admin/:path*", "/auth/login", "/auth/register"],
};
