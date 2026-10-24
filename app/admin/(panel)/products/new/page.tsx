"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductForm } from "../../../../components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-[var(--brand)]">
          ← Products
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Add product</h1>
      <p className="mt-2 text-gray-600">Create a listing with photos, pricing, and inventory.</p>
      <div className="mt-8">
        <ProductForm mode="create" onSaved={(id) => router.push(`/admin/products/${id}`)} />
      </div>
    </div>
  );
}
