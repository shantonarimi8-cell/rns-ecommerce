import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { loadCatalogMaps, toDetail } from "../../../../lib/catalog";
import { getAdminUser } from "../../../../lib/admin";
import { dec } from "../../../../lib/decimal";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  const maps = await loadCatalogMaps();
  const product = maps.products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toDetail(product, maps));
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  const maps = await loadCatalogMaps();
  if (!maps.products.some((p) => p.id === productId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  await db.orm.public.Product.where({ id: productId }).update({
    name: String(body.name ?? "").trim(),
    slug: String(body.slug ?? "").trim(),
    description: String(body.description ?? "").trim() || null,
    categoryId: Number(body.categoryId),
    isActive: Boolean(body.isActive),
  });

  if (Array.isArray(body.images)) {
    const existingImages = maps.images.filter((i) => i.productId === productId);
    for (const img of existingImages) {
      await db.orm.public.ProductImage.where({ id: img.id }).delete();
    }
    for (let i = 0; i < body.images.length; i++) {
      const row = body.images[i];
      const url = String(row.url ?? "").trim();
      if (!url) continue;
      await db.orm.public.ProductImage.create({
        productId,
        url,
        sortOrder: row.sortOrder ?? i,
        isPrimary: Boolean(row.isPrimary),
      });
    }
  }

  if (Array.isArray(body.variants)) {
    const existingVariants = maps.variants.filter((v) => v.productId === productId);
    for (const v of existingVariants) {
      await db.orm.public.ProductVariant.where({ id: v.id }).delete();
    }
    for (const v of body.variants) {
      await db.orm.public.ProductVariant.create({
        productId,
        sku: String(v.sku).trim(),
        size: v.size ? String(v.size) : null,
        color: v.color ? String(v.color) : null,
        price: dec(Number(v.price)),
        stock: Number(v.stock),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  const maps = await loadCatalogMaps();

  for (const img of maps.images.filter((i) => i.productId === productId)) {
    await db.orm.public.ProductImage.where({ id: img.id }).delete();
  }
  for (const v of maps.variants.filter((v) => v.productId === productId)) {
    await db.orm.public.ProductVariant.where({ id: v.id }).delete();
  }
  for (const w of (await db.orm.public.Wishlist.all()).filter(
    (w) => w.productId === productId
  )) {
    await db.orm.public.Wishlist.where({ id: w.id }).delete();
  }

  await db.orm.public.Product.where({ id: productId }).delete();
  return NextResponse.json({ ok: true });
}
