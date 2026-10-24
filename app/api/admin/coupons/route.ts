import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { getAdminUser } from "../../../lib/admin";
import { dec } from "../../../lib/decimal";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const coupons = await db.orm.public.Coupon.all();
  return NextResponse.json(
    coupons.map((c) => ({
      ...c,
      value: Number(c.value),
      minSubtotal: c.minSubtotal ? Number(c.minSubtotal) : null,
    }))
  );
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const type = String(body.type ?? "PERCENT").toUpperCase();
  const value = Number(body.value);
  const minSubtotal = body.minSubtotal ? Number(body.minSubtotal) : null;
  const maxUses = body.maxUses ? Number(body.maxUses) : null;
  const expiresAt = body.expiresAt ? String(body.expiresAt) : null;
  const isActive = body.isActive !== false;

  if (!code || !Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
  }

  if (type !== "PERCENT" && type !== "FIXED") {
    return NextResponse.json({ error: "Type must be PERCENT or FIXED" }, { status: 400 });
  }

  const created = await db.orm.public.Coupon.create({
    code,
    type,
    value: dec(value),
    minSubtotal: minSubtotal != null ? dec(minSubtotal) : null,
    maxUses,
    expiresAt,
    isActive,
  });

  return NextResponse.json(created, { status: 201 });
}
