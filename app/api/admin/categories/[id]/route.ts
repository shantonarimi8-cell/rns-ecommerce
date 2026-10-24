import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { getAdminUser } from "../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const categoryId = Number(id);
  const categories = await db.orm.public.Category.all();
  if (!categories.some((c) => c.id === categoryId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  await db.orm.public.Category.where({ id: categoryId }).update({
    name: String(body.name ?? "").trim(),
    slug: String(body.slug ?? "").trim(),
    description: String(body.description ?? "").trim() || null,
    imageUrl: String(body.imageUrl ?? "").trim() || null,
    sortOrder: Number(body.sortOrder ?? 0),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const categoryId = Number(id);

  const products = await db.orm.public.Product.all();
  if (products.some((p) => p.categoryId === categoryId)) {
    return NextResponse.json(
      { error: "Remove products from this category first" },
      { status: 400 }
    );
  }

  await db.orm.public.Category.where({ id: categoryId }).delete();
  return NextResponse.json({ ok: true });
}
