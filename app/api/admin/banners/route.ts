import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const banners = await db.orm.public.Banner.all();
  return NextResponse.json(banners.sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const subtitle = String(body.subtitle ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const linkUrl = String(body.linkUrl ?? "").trim();
  const sortOrder = Number(body.sortOrder ?? 0);
  const isActive = body.isActive !== false;

  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Title and image required" }, { status: 400 });
  }

  const created = await db.orm.public.Banner.create({
    title,
    subtitle: subtitle || null,
    imageUrl,
    linkUrl: linkUrl || null,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isActive,
  });

  return NextResponse.json(created, { status: 201 });
}
