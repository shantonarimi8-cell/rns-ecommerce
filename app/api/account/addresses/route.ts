import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../src/prisma/db";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/session";

async function getUserId() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await db.orm.public.Address.all();
  const mine = addresses
    .filter((a) => a.userId === userId)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return NextResponse.json(mine);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const label = String(body.label ?? "Home").trim() || "Home";
  const line1 = String(body.line1 ?? "").trim();
  const line2 = String(body.line2 ?? "").trim();
  const city = String(body.city ?? "").trim();
  const region = String(body.region ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim();
  const isDefault = Boolean(body.isDefault);

  if (!line1 || !city) {
    return NextResponse.json(
      { error: "Address line and city are required" },
      { status: 400 }
    );
  }

  if (isDefault) {
    const all = await db.orm.public.Address.all();
    for (const addr of all.filter((a) => a.userId === userId && a.isDefault)) {
      await db.orm.public.Address.where({ id: addr.id }).update({
        isDefault: false,
      });
    }
  }

  const created = await db.orm.public.Address.create({
    userId,
    label,
    line1,
    line2: line2 || null,
    city,
    region: region || null,
    postalCode: postalCode || null,
    isDefault,
  });

  return NextResponse.json(created, { status: 201 });
}
