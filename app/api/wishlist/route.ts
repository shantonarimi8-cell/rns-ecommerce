import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../src/prisma/db";
import { loadCatalogMaps, toListItem } from "../../lib/catalog";
import { SESSION_COOKIE, verifySessionToken } from "../../lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return NextResponse.json(
      { error: "Please login to use your wishlist" },
      { status: 401 }
    );
  }

  const [wishlist, maps] = await Promise.all([
    db.orm.public.Wishlist.all(),
    loadCatalogMaps(),
  ]);

  const items = wishlist
    .filter((w) => w.userId === userId)
    .map((w) => {
      const product = maps.products.find((p) => p.id === w.productId);
      if (!product) return null;
      return toListItem(product, maps);
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return NextResponse.json(
      { error: "Please login to use your wishlist" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const productId = Number(body.productId);

  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const wishlist = await db.orm.public.Wishlist.all();
  const existing = wishlist.find(
    (w) => w.userId === userId && w.productId === productId
  );

  if (existing) {
    await db.orm.public.Wishlist.where({ id: existing.id }).delete();
    return NextResponse.json({ wishlisted: false });
  }

  await db.orm.public.Wishlist.create({ userId, productId });
  return NextResponse.json({ wishlisted: true });
}
