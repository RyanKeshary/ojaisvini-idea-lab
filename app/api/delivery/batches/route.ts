import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { poolOrders, markBatchCollected } from "@/lib/orders/service";

/** Build/refresh the pooled pickup batch for a pincode (seller or Sakhi). */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || !["WOMAN", "SAKHI", "ADMIN", "MENTOR"].includes(role ?? "")) {
    return NextResponse.json({ code: "no-account" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ pincode: z.string().regex(/^\d{6}$/) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  const result = await poolOrders(parsed.data.pincode);
  return NextResponse.json({ ok: true, ...result });
}

/** List batches (most recent first). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  const pincode = new URL(req.url).searchParams.get("pincode") || "";
  const batches = await db.deliveryBatch.findMany({
    where: pincode ? { pincode } : {},
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { deliveries: { include: { order: { select: { id: true, status: true, total: true, buyerName: true } } } } },
  });
  return NextResponse.json({ ok: true, batches });
}

/** Mark a batch collected (Sakhi at the village pickup; shop owner allowed too). */
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ code: "no-account" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  }
  const parsed = z.object({ batchId: z.string().min(1).max(64) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "invalid-input" }, { status: 400 });
  await markBatchCollected(parsed.data.batchId);
  return NextResponse.json({ ok: true });
}
