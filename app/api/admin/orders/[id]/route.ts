import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { getAdminUser } from "../../../../lib/admin";
import { serializeOrder } from "../../../../lib/orders";

type RouteContext = { params: Promise<{ id: string }> };

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  const full = await serializeOrder(orderId);
  if (!full) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(full);
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  const body = await request.json();
  const status = String(body.status ?? "");

  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const orders = await db.orm.public.Order.all();
  if (!orders.some((o) => o.id === orderId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.orm.public.Order.where({ id: orderId }).update({ status });
  return NextResponse.json({ ok: true });
}
