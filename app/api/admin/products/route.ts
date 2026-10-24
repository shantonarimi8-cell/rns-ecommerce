import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { loadCatalogMaps, slugify, toListItem } from "../../../lib/catalog";
import { getAdminUser } from "../../../lib/admin";
import { dec } from "../../../lib/decimal";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const maps = await loadCatalogMaps();
  const items = maps.products
    .map((p) => {
      const base = toListItem(p, maps);
      if (!base) return null;
      const variantCount = maps.variants.filter((v) => v.productId === p.id).length;
      return {
        ...base,
        variantCount,
        stockTotal: maps.variants
          .filter((v) => v.productId === p.id)
          .reduce((s, v) => s + v.stock, 0),
      };
    })
    .filter(Boolean);

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? slugify(name)).trim();
  const description = String(body.description ?? "").trim();
  const categoryId = Number(body.categoryId);
  const isActive = body.isActive !== false;
  const images: { url: string; sortOrder?: number; isPrimary?: boolean }[] =
    Array.isArray(body.images) ? body.images : [];
  const variants: {
    sku: string;
    size?: string;
    color?: string;
    price: number;
    stock: number;
  }[] = Array.isArray(body.variants) ? body.variants : [];

  if (!name || !slug || !Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }

  if (variants.length === 0) {
    return NextResponse.json({ error: "Add at least one variant" }, { status: 400 });
  }

  const product = await db.orm.public.Product.create({
    name,
    slug,
    description: description || null,
    categoryId,
    isActive,
  });

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const url = String(img.url ?? "").trim();
    if (!url) continue;
    await db.orm.public.ProductImage.create({
      productId: product.id,
      url,
      sortOrder: img.sortOrder ?? i,
      isPrimary: Boolean(img.isPrimary) || i === 0,
    });
  }

  for (const v of variants) {
    await db.orm.public.ProductVariant.create({
      productId: product.id,
      sku: String(v.sku).trim(),
      size: v.size ? String(v.size) : null,
      color: v.color ? String(v.color) : null,
      price: dec(Number(v.price)),
      stock: Number(v.stock),
    });
  }

  return NextResponse.json({ id: product.id }, { status: 201 });
}
