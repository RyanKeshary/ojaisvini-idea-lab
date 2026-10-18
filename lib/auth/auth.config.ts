import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration for middleware.
 * Contains no database or Node.js imports.
 */
export const authConfig: NextAuthConfig = {
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "dev-secret-change-in-production-please-1234567890",
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.phone = (user as { phone?: string }).phone;
        token.role = (user as { role?: string }).role;
        if (user.name !== undefined) token.name = user.name;
        if (user.email !== undefined) token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session) {
        return session;
      }
      if (!session.user) {
        session.user = {
          id: String(token?.uid ?? token?.sub ?? ""),
          phone: token?.phone as string | undefined,
          role: (token?.role as string) ?? "WOMAN",
          name: (token?.name as string) ?? null,
          email: (token?.email as string) ?? "",
        } as any;
      } else {
        session.user.id = String(token?.uid ?? token?.sub ?? "");
        session.user.phone = token?.phone as string | undefined;
        session.user.role = (token?.role as string) ?? "WOMAN";
      }
      return session;
    },
  },
};
