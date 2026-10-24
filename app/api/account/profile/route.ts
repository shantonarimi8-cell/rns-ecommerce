import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../src/prisma/db";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/session";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await db.orm.public.User.where({ id: userId }).update({
    name,
    phone: phone || null,
  });

  return NextResponse.json({ ok: true });
}
