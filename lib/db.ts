if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.DATABASE_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    "file:./dev.db";
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yebysrmdiabvubxfozby.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function sbHeaders(prefer?: string): Record<string, string> {
  const h: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) h.Prefer = prefer;
  return h;
}

const RELATION_MODEL_MAP: Record<string, Record<string, string>> = {
  Order: {
    shop: "Shop",
    events: "OrderEvent",
    payment: "Payment",
    itemsRel: "OrderItem",
  },
  Shop: {
    user: "User",
    owner: "User",
    products: "Product",
    orders: "Order",
    payouts: "Payout",
  },
  Product: {
    shop: "Shop",
  },
  Payout: {
    order: "Order",
    shop: "Shop",
  },
  User: {
    shops: "Shop",
    savedSchemes: "SavedScheme",
    badges: "UserBadge",
  },
  AuthTicket: {
    user: "User",
    User: "User",
  },
};

function getRelationTargetTable(sourceTable: string, relProp: string): string {
  const custom = RELATION_MODEL_MAP[sourceTable]?.[relProp];
  if (custom) return custom;
  return relProp.charAt(0).toUpperCase() + relProp.slice(1);
}

function cleanRow(row: any): any {
  if (!row || typeof row !== "object") return row;
  const out = Array.isArray(row) ? [...row] : { ...row };
  for (const k of Object.keys(out)) {
    if (k.endsWith("At") && typeof out[k] === "string") {
      out[k] = new Date(out[k]);
    }
  }
  return out;
}

function buildFilter(query: string, where: any): string {
  if (!where) return query;
  let q = query;
  for (const [k, v] of Object.entries(where)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      const sub = v as Record<string, any>;
      if ("in" in sub && Array.isArray(sub.in)) {
        if (sub.in.length === 0) {
          q += `&${k}=in.()`;
        } else {
          q += `&${k}=in.(${sub.in.map((item: any) => encodeURIComponent(String(item))).join(",")})`;
        }
      } else if ("equals" in sub) {
        q += `&${k}=eq.${encodeURIComponent(String(sub.equals))}`;
      } else if ("not" in sub) {
        q += `&${k}=neq.${encodeURIComponent(String(sub.not))}`;
      }
    } else {
      q += `&${k}=eq.${encodeURIComponent(String(v))}`;
    }
  }
  return q;
}

function buildSelectString(table: string, params: any): string {
  if (params?.select && !params?.include) {
    const keys = Object.keys(params.select).filter((k) => params.select[k]);
    if (keys.length > 0) return keys.join(",");
  }
  const selectParts: string[] = ["*"];
  if (params?.include) {
    for (const rel of Object.keys(params.include)) {
      const targetTable = getRelationTargetTable(table, rel);
      selectParts.push(`${rel}:${targetTable}(*)`);
    }
  }
  return selectParts.join(",");
}

const TABLES_WITH_UPDATED_AT = new Set([
  "User",
  "ChatThread",
  "Shop",
  "Product",
  "Order",
  "Payment",
  "Refund",
  "Delivery",
  "DeliveryBatch",
  "FeatureFlag",
]);

async function runSupabaseQuery(table: string, method: string, params: any = {}): Promise<any> {
  const base = `${SUPABASE_URL}/rest/v1/${table}`;

  switch (method) {
    case "findUnique":
    case "findFirst": {
      let query = `${base}?limit=1`;
      const selectStr = buildSelectString(table, params);
      query += `&select=${encodeURIComponent(selectStr)}`;
      query = buildFilter(query, params.where);

      if (params.orderBy) {
        for (const [k, v] of Object.entries(params.orderBy)) {
          query += `&order=${k}.${v === "desc" ? "desc" : "asc"}`;
        }
      }

      const res = await fetch(query, { headers: sbHeaders() });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] ? cleanRow(rows[0]) : null;
    }

    case "findMany": {
      let query = `${base}?`;
      const selectStr = buildSelectString(table, params);
      query += `select=${encodeURIComponent(selectStr)}`;
      query = buildFilter(query, params.where);

      if (params.orderBy) {
        for (const [k, v] of Object.entries(params.orderBy)) {
          query += `&order=${k}.${v === "desc" ? "desc" : "asc"}`;
        }
      }
      if (params.take) query += `&limit=${params.take}`;
      if (params.skip) query += `&offset=${params.skip}`;

      const res = await fetch(query, { headers: sbHeaders() });
      if (!res.ok) return [];
      const rows = await res.json();
      return Array.isArray(rows) ? rows.map(cleanRow) : [];
    }

    case "create": {
      const data = { ...params.data };
      if (!data.id) {
        data.id = `${table.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      if (TABLES_WITH_UPDATED_AT.has(table) && !data.updatedAt) {
        data.updatedAt = new Date().toISOString();
      }

      const res = await fetch(base, {
        method: "POST",
        headers: sbHeaders("return=representation"),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase create error on ${table}: ${err}`);
      }
      const rows = await res.json();
      return rows[0] ? cleanRow(rows[0]) : cleanRow(data);
    }

    case "update": {
      let query = `${base}?`;
      if (params.where?.id) {
        query += `id=eq.${encodeURIComponent(params.where.id)}`;
      } else if (params.where) {
        query = buildFilter(query, params.where);
      }
      const data = { ...params.data };
      if (TABLES_WITH_UPDATED_AT.has(table)) {
        data.updatedAt = new Date().toISOString();
      }
      const res = await fetch(query, {
        method: "PATCH",
        headers: sbHeaders("return=representation"),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase update error on ${table}: ${err}`);
      }
      const rows = await res.json();
      return rows[0] ? cleanRow(rows[0]) : null;
    }

    case "updateMany": {
      let query = `${base}?`;
      query = buildFilter(query, params.where);
      const data = { ...params.data };
      if (TABLES_WITH_UPDATED_AT.has(table)) {
        data.updatedAt = new Date().toISOString();
      }
      const res = await fetch(query, {
        method: "PATCH",
        headers: sbHeaders("return=representation"),
        body: JSON.stringify(data),
      });
      if (!res.ok) return { count: 0 };
      const rows = await res.json();
      return { count: Array.isArray(rows) ? rows.length : 1 };
    }

    case "delete": {
      let query = `${base}?`;
      if (params.where?.id) {
        query += `id=eq.${encodeURIComponent(params.where.id)}`;
      } else if (params.where) {
        query = buildFilter(query, params.where);
      }
      const res = await fetch(query, { method: "DELETE", headers: sbHeaders() });
      return { ok: res.ok };
    }

    case "deleteMany": {
      let query = `${base}?`;
      query = buildFilter(query, params.where);
      const res = await fetch(query, { method: "DELETE", headers: sbHeaders() });
      return { count: res.ok ? 1 : 0 };
    }

    case "count": {
      let query = `${base}?select=count`;
      query = buildFilter(query, params.where);
      const res = await fetch(query, {
        headers: { ...sbHeaders(), Range: "0-0", Prefer: "count=exact" },
      });
      const range = res.headers.get("content-range");
      if (range) {
        const total = range.split("/")[1];
        return total ? parseInt(total, 10) : 0;
      }
      return 0;
    }

    default:
      throw new Error(`Method ${method} not implemented in Supabase PostgREST adapter`);
  }
}

const rawPrisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = rawPrisma;

export const db: PrismaClient = new Proxy(rawPrisma as any, {
  get(target, prop: string) {
    if (typeof prop !== "string" || prop.startsWith("$")) {
      return target[prop];
    }
    const cap = prop.charAt(0).toUpperCase() + prop.slice(1);
    return new Proxy(target[prop] || {}, {
      get(modelTarget, method: string) {
        return async (...args: any[]) => {
          if (hasSupabase()) {
            try {
              return await runSupabaseQuery(cap, method, args[0]);
            } catch (e) {
              if (typeof modelTarget[method] === "function") {
                return await modelTarget[method](...args);
              }
              throw e;
            }
          }
          if (typeof modelTarget[method] === "function") {
            return await modelTarget[method](...args);
          }
        };
      },
    });
  },
}) as PrismaClient;
