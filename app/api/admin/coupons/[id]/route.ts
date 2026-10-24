import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { getAdminUser } from "../../../../lib/admin";
import { dec } from "../../../../lib/decimal";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const couponId = Number(id);
  const coupons = await db.orm.public.Coupon.all();
  if (!coupons.some((c) => c.id === couponId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  await db.orm.public.Coupon.where({ id: couponId }).update({
    code: String(body.code ?? "").trim().toUpperCase(),
    type: String(body.type ?? "PERCENT").toUpperCase(),
    value: dec(Number(body.value)),
    minSubtotal: body.minSubtotal ? dec(Number(body.minSubtotal)) : null,
    maxUses: body.maxUses ? Number(body.maxUses) : null,
    expiresAt: body.expiresAt ? String(body.expiresAt) : null,
    isActive: Boolean(body.isActive),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  await db.orm.public.Coupon.where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}
