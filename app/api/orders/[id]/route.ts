import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { serializeOrder } from "../../../lib/orders";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return NextResponse.json({ error: "Please login to view this order" }, { status: 401 });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  const orders = await db.orm.public.Order.all();
  const order = orders.find((o) => o.id === orderId);

  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const full = await serializeOrder(orderId);
  if (!full) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(full);
}
