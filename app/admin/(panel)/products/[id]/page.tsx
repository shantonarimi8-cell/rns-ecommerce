"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm, type ProductFormValues } from "../../../../components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Partial<ProductFormValues> | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setLoadError("Product not found");
          return;
        }
        const p = await r.json();
        setInitial({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          categoryId: String(p.categoryId),
          isActive: p.isActive,
          images: p.images.map((i: { url: string }) => i.url),
          variants: p.variants.map(
            (v: { sku: string; size?: string; color?: string; price: number; stock: number }) => ({
              sku: v.sku,
              size: v.size ?? "",
              color: v.color ?? "",
              price: String(v.price),
              stock: String(v.stock),
            })
          ),
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.push("/admin/products");
  };

  if (loading) {
    return <p className="text-gray-600">Loading product…</p>;
  }

  if (loadError || !initial) {
    return (
      <div>
        <p className="text-red-600">{loadError || "Could not load product"}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-[var(--brand)] underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-[var(--brand)]">
          ← Products
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Edit product</h1>
      <p className="mt-2 text-gray-600">Update details, images, and variants.</p>
      <div className="mt-8">
        <ProductForm
          mode="edit"
          productId={Number(id)}
          initial={initial}
          onSaved={() => router.push("/admin/products")}
          onDelete={remove}
        />
      </div>
    </div>
  );
}
