import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { serializeOrder } from "../../../lib/orders";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await db.orm.public.Order.all();
  const sorted = orders.sort((a, b) => b.id - a.id);
  const result = [];

  for (const o of sorted) {
    const full = await serializeOrder(o.id);
    if (full) result.push(full);
  }

  return NextResponse.json(result);
}
