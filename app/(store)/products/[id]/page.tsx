"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Container } from "../../../components/ui/Container";
import { Button } from "../../../components/ui/Button";
import { ProductCard } from "../../../components/store/ProductCard";
import { useCart } from "../../../cart-context";

type Variant = {
  id: number;
  label: string;
  price: number;
  stock: number;
  size: string | null;
  color: string | null;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  categoryName: string;
  categorySlug: string;
  images: { id: number; url: string; isPrimary: boolean }[];
  variants: Variant[];
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<
    { id: number; name: string; imageUrl: string | null; minPrice: number; maxPrice: number; inStock: boolean }[]
  >([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) return;
      const data: Product = await res.json();
      setProduct(data);
      const firstInStock = data.variants.find((v) => v.stock > 0) ?? data.variants[0];
      setSelectedVariantId(firstInStock?.id ?? null);
      setActiveImage(data.images[0]?.url ?? data.imageUrl);

      const allRes = await fetch(`/api/products?category=${data.categorySlug}`);
      if (allRes.ok) {
        const list = await allRes.json();
        setRelated(list.filter((p: { id: number }) => p.id !== data.id).slice(0, 4));
      }

      const wishRes = await fetch("/api/wishlist");
      if (wishRes.ok) {
        const wish = await wishRes.json();
        setWishlisted(wish.some((w: { id: number }) => w.id === data.id));
      }
    }
    load();
  }, [productId]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId]
  );

  const sizes = useMemo(() => {
    if (!product) return [];
    return [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  }, [product]);

  const colors = useMemo(() => {
    if (!product) return [];
    return [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  }, [product]);

  if (!product) {
    return <Container className="py-10">Loading product...</Container>;
  }

  const toggleWishlist = async () => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.status === 401) {
      alert("Please login to use wishlist");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setWishlisted(data.wishlisted);
    }
  };

  const handleAdd = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      imageUrl: activeImage,
      maxStock: selectedVariant.stock,
      quantity: 1,
    });
    setAdded(true);
  };

  return (
    <Container className="py-8">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/">Home</Link> /{" "}
        <Link href={`/products?category=${product.categorySlug}`}>{product.categoryName}</Link> /{" "}
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No image</div>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImage(img.url)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded border ${activeImage === img.url ? "border-[var(--brand)]" : "border-gray-200"}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">
            ৳{selectedVariant?.price ?? product.minPrice}
          </p>
          <p className="mt-3 text-gray-600">{product.description}</p>

          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const match = product.variants.find(
                        (v) =>
                          v.size === size &&
                          (selectedVariant?.color ? v.color === selectedVariant.color : true)
                      );
                      if (match) setSelectedVariantId(match.id);
                    }}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const match = product.variants.find(
                        (v) =>
                          v.color === color &&
                          (selectedVariant?.size ? v.size === selectedVariant.size : true)
                      );
                      if (match) setSelectedVariantId(match.id);
                    }}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm">
            Selected: <strong>{selectedVariant?.label ?? "—"}</strong> · Stock:{" "}
            {selectedVariant?.stock ?? 0}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleAdd}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
            >
              {added ? "Added to cart ✓" : "Add to cart"}
            </Button>
            <Button variant="secondary" onClick={toggleWishlist}>
              {wishlisted ? "Remove wishlist" : "Add to wishlist"}
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
