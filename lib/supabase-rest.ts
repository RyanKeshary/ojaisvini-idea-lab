/**
 * Supabase PostgREST direct client.
 * Supabase direct PostgreSQL host (port 5432) uses IPv6 which is unreachable
 * from AWS Lambda / Vercel serverless functions.
 * The REST API (https://<ref>.supabase.co/rest/v1) is available over IPv4/IPv6 HTTPS.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yebysrmdiabvubxfozby.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getHeaders(prefer?: string) {
  const h: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

export const supabaseRest = {
  isConfigured: () => Boolean(SUPABASE_URL && SUPABASE_KEY),

  async findUserByPhone(phone: string) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/User?phone=eq.${encodeURIComponent(phone)}&limit=1`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch {
      return null;
    }
  },

  async updateUser(id: string, data: Record<string, any>) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: getHeaders("return=representation"),
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch {
      return null;
    }
  },

  async createUser(data: Record<string, any>) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/User`, {
        method: "POST",
        headers: getHeaders("return=representation"),
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch {
      return null;
    }
  },

  async createAuditLog(data: { actorId?: string | null; action: string; meta?: string }) {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/AuditLog`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          action: data.action,
          meta: data.meta || "{}",
          actorId: data.actorId || null,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Non-blocking
    }
  },

  async saveOtp(phone: string, hash: string, expiresAt: Date) {
    if (!this.isConfigured()) return;
    try {
      // Delete old OTP tokens for this phone
      await fetch(`${SUPABASE_URL}/rest/v1/OtpToken?phone=eq.${encodeURIComponent(phone)}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      // Insert new token
      await fetch(`${SUPABASE_URL}/rest/v1/OtpToken`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          id: `otp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          phone,
          hash,
          expiresAt: expiresAt.toISOString(),
          attempts: 0,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Non-blocking
    }
  },

  async findOtpToken(phone: string) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/OtpToken?phone=eq.${encodeURIComponent(phone)}&order=createdAt.desc&limit=1`,
        { headers: getHeaders() }
      );
      if (!res.ok) return null;
      const rows = await res.json();
      const row = rows[0];
      if (!row) return null;
      return {
        ...row,
        expiresAt: new Date(row.expiresAt),
      };
    } catch {
      return null;
    }
  },

  async deleteOtpToken(id: string) {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/OtpToken?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
    } catch {
      // Non-blocking
    }
  },

  async updateOtpAttempts(id: string, attempts: number) {
    if (!this.isConfigured()) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/OtpToken?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ attempts }),
      });
    } catch {
      // Non-blocking
    }
  },

  async createTicket(userId: string, expiresAt: Date): Promise<string> {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (!this.isConfigured()) return ticketId;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/AuthTicket?userId=eq.${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      await fetch(`${SUPABASE_URL}/rest/v1/AuthTicket`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          id: ticketId,
          userId,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Fall through with returned ticketId
    }
    return ticketId;
  },

  async redeemTicket(id: string) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/AuthTicket?id=eq.${encodeURIComponent(id)}&select=*,User(*)`,
        { headers: getHeaders() }
      );
      if (!res.ok) return null;
      const rows = await res.json();
      const ticket = rows[0];
      if (!ticket) return null;

      // Delete redeemed ticket
      await fetch(`${SUPABASE_URL}/rest/v1/AuthTicket?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getHeaders(),
      }).catch(() => {});

      if (new Date(ticket.expiresAt).getTime() < Date.now()) return null;
      const user = ticket.User;
      if (!user || user.deletedAt) return null;
      return user;
    } catch {
      return null;
    }
  },
};
