import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../../src/prisma/db";
import { SESSION_COOKIE, verifySessionToken } from "../../../../lib/session";

type RouteContext = { params: Promise<{ id: string }> };

async function getUserId() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, context: RouteContext) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const addressId = Number(id);
  if (!Number.isInteger(addressId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const addresses = await db.orm.public.Address.all();
  const existing = addresses.find((a) => a.id === addressId && a.userId === userId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const label = String(body.label ?? existing.label).trim() || "Home";
  const line1 = String(body.line1 ?? existing.line1).trim();
  const line2 = String(body.line2 ?? existing.line2 ?? "").trim();
  const city = String(body.city ?? existing.city).trim();
  const region = String(body.region ?? existing.region ?? "").trim();
  const postalCode = String(body.postalCode ?? existing.postalCode ?? "").trim();
  const isDefault = Boolean(body.isDefault);

  if (!line1 || !city) {
    return NextResponse.json(
      { error: "Address line and city are required" },
      { status: 400 }
    );
  }

  if (isDefault) {
    for (const addr of addresses.filter((a) => a.userId === userId && a.isDefault)) {
      if (addr.id !== addressId) {
        await db.orm.public.Address.where({ id: addr.id }).update({
          isDefault: false,
        });
      }
    }
  }

  await db.orm.public.Address.where({ id: addressId }).update({
    label,
    line1,
    line2: line2 || null,
    city,
    region: region || null,
    postalCode: postalCode || null,
    isDefault,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const addressId = Number(id);
  const addresses = await db.orm.public.Address.all();
  const existing = addresses.find((a) => a.id === addressId && a.userId === userId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.orm.public.Address.where({ id: addressId }).delete();
  return NextResponse.json({ ok: true });
}
