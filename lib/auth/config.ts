import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    phone?: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      phone?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    phone?: string;
    role?: string;
  }
}

/**
 * Verification (OTP/PIN/staff + all error codes) happens in the
 * /api/auth/{otp,pin,staff}/verify routes, which mint a single-use
 * AuthTicket. This provider only redeems the ticket — one code path,
 * precise errors, no double-verification.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        mode: { label: "mode", type: "text" },
        ticket: { label: "ticket", type: "text" },
      },
      async authorize(raw) {
        if (String(raw?.mode ?? "") !== "ticket") return null;
        // Lazy: never evaluated in Edge middleware (authorize runs only in the route handler).
        const { redeemTicket } = await import("@/lib/auth/ticket");
        const user = await redeemTicket(String(raw?.ticket ?? ""));
        if (!user) return null;
        return {
          id: user.id,
          name: user.name || null,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.phone = user.phone;
        token.role = user.role;
        if (user.name !== undefined) token.name = user.name;
        if (user.email !== undefined) token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.uid ?? token.sub ?? "");
      session.user.phone = token.phone;
      session.user.role = token.role ?? "WOMAN";
      return session;
    },
  },
});
