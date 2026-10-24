import { db } from "../../src/prisma/db";

export type VariantDto = {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  label: string;
};

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  isActive: boolean;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  createdAt: string;
};

export type ProductDetail = ProductListItem & {
  images: { id: number; url: string; isPrimary: boolean; sortOrder: number }[];
  variants: VariantDto[];
};

function variantLabel(size: string | null, color: string | null) {
  const parts = [size, color].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Default";
}

export async function loadCatalogMaps() {
  const [categories, products, images, variants] = await Promise.all([
    db.orm.public.Category.all(),
    db.orm.public.Product.all(),
    db.orm.public.ProductImage.all(),
    db.orm.public.ProductVariant.all(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  return { categories, products, images, variants, categoryById };
}

export function toListItem(
  product: Awaited<ReturnType<typeof loadCatalogMaps>>["products"][0],
  maps: Awaited<ReturnType<typeof loadCatalogMaps>>
): ProductListItem | null {
  const category = maps.categoryById.get(product.categoryId);
  if (!category) return null;

  const productImages = maps.images
    .filter((i) => i.productId === product.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primary =
    productImages.find((i) => i.isPrimary) ?? productImages[0] ?? null;

  const productVariants = maps.variants.filter((v) => v.productId === product.id);
  const prices = productVariants.map((v) => Number(v.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const inStock = productVariants.some((v) => v.stock > 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    categorySlug: category.slug,
    categoryName: category.name,
    isActive: product.isActive,
    imageUrl: primary?.url ?? null,
    minPrice,
    maxPrice,
    inStock,
    createdAt: product.createdAt,
  };
}

export function toDetail(
  product: Awaited<ReturnType<typeof loadCatalogMaps>>["products"][0],
  maps: Awaited<ReturnType<typeof loadCatalogMaps>>
): ProductDetail | null {
  const base = toListItem(product, maps);
  if (!base) return null;

  const productImages = maps.images
    .filter((i) => i.productId === product.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({
      id: i.id,
      url: i.url,
      isPrimary: i.isPrimary,
      sortOrder: i.sortOrder,
    }));

  const variants = maps.variants
    .filter((v) => v.productId === product.id)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: Number(v.price),
      stock: v.stock,
      label: variantLabel(v.size, v.color),
    }));

  return { ...base, images: productImages, variants };
}

export { slugify } from "./slugify";
