import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration for middleware.
 * Contains no database or Node.js imports.
 */
export const authConfig: NextAuthConfig = {
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
      session.user.id = String(token.uid ?? token.sub ?? "");
      session.user.phone = token.phone as string | undefined;
      session.user.role = (token.role as string) ?? "WOMAN";
      return session;
    },
  },
};
