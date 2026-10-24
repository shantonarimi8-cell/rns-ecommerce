import { NextResponse } from "next/server";
import { loadCatalogMaps, toListItem } from "../../lib/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockOnly = searchParams.get("inStock") === "1";
    const sort = searchParams.get("sort") ?? "newest";

    const maps = await loadCatalogMaps();
    let items = maps.products
      .filter((p) => p.isActive)
      .map((p) => toListItem(p, maps))
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (category) {
      items = items.filter((p) => p.categorySlug === category);
    }

    if (search) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.description?.toLowerCase().includes(search) ?? false)
      );
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (Number.isFinite(min)) {
        items = items.filter((p) => p.maxPrice >= min);
      }
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (Number.isFinite(max)) {
        items = items.filter((p) => p.minPrice <= max);
      }
    }

    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    if (sort === "price_asc") {
      items.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === "price_desc") {
      items.sort((a, b) => b.minPrice - a.minPrice);
    } else {
      items.sort((a, b) => b.id - a.id);
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to load products:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
