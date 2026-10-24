import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { serializeOrder } from "../../../../lib/orders";
import { getAdminUser } from "../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const userId = Number(id);
  const users = await db.orm.public.User.all();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const addresses = (await db.orm.public.Address.all()).filter(
    (a) => a.userId === userId
  );
  const orders = (await db.orm.public.Order.all())
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.id - a.id);

  const orderDetails = [];
  for (const o of orders) {
    const full = await serializeOrder(o.id);
    if (full) orderDetails.push(full);
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    addresses,
    orders: orderDetails,
  });
}
