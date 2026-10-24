import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { slugify } from "../../../lib/catalog";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const categories = await db.orm.public.Category.all();
  return NextResponse.json(categories.sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? slugify(name)).trim();
  const description = String(body.description ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const sortOrder = Number(body.sortOrder ?? 0);

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
  }

  const created = await db.orm.public.Category.create({
    name,
    slug,
    description: description || null,
    imageUrl: imageUrl || null,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  return NextResponse.json(created, { status: 201 });
}
