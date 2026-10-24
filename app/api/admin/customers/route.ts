import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, orders, addresses] = await Promise.all([
    db.orm.public.User.all(),
    db.orm.public.Order.all(),
    db.orm.public.Address.all(),
  ]);

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();

  const customers = users
    .filter((u) => u.email.toLowerCase() !== adminEmail)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      orderCount: orders.filter((o) => o.userId === u.id).length,
      addressCount: addresses.filter((a) => a.userId === u.id).length,
      createdAt: u.createdAt,
    }))
    .sort((a, b) => b.id - a.id);

  return NextResponse.json(customers);
}
