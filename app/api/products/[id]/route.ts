import { NextResponse } from "next/server";
import { loadCatalogMaps, toDetail } from "../../../lib/catalog";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const maps = await loadCatalogMaps();
    const product = maps.products.find((p) => p.id === productId);

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const detail = toDetail(product, maps);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("Failed to load product:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
