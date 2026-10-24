import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { getAdminUser } from "../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const bannerId = Number(id);
  const body = await request.json();

  await db.orm.public.Banner.where({ id: bannerId }).update({
    title: String(body.title ?? "").trim(),
    subtitle: String(body.subtitle ?? "").trim() || null,
    imageUrl: String(body.imageUrl ?? "").trim(),
    linkUrl: String(body.linkUrl ?? "").trim() || null,
    sortOrder: Number(body.sortOrder ?? 0),
    isActive: Boolean(body.isActive),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  await db.orm.public.Banner.where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}
