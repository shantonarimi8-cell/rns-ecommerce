import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [products, orders, users, variants] = await Promise.all([
    db.orm.public.Product.all(),
    db.orm.public.Order.all(),
    db.orm.public.User.all(),
    db.orm.public.ProductVariant.all(),
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= 5).length;

  const recentOrders = orders
    .sort((a, b) => b.id - a.id)
    .slice(0, 8)
    .map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    }));

  return NextResponse.json({
    productCount: products.length,
    orderCount: orders.length,
    userCount: users.length,
    revenue,
    lowStockVariantCount: lowStock,
    recentOrders,
  });
}
