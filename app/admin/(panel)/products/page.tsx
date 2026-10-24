"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  categoryName: string;
  minPrice: number;
  isActive: boolean;
  variantCount: number;
  stockTotal: number;
  imageUrl: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/admin/products").then(async (r) => r.ok && setProducts(await r.json()));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-[var(--brand)] px-4 py-2 text-white">
          Add product
        </Link>
      </div>
      <table className="mt-6 w-full overflow-hidden rounded-xl border bg-white text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-3">Product</th>
            <th>Category</th>
            <th>Variants</th>
            <th>Stock</th>
            <th>Price from</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />}
                  {p.name}
                </div>
              </td>
              <td>{p.categoryName}</td>
              <td>{p.variantCount}</td>
              <td>{p.stockTotal}</td>
              <td>৳{p.minPrice}</td>
              <td>{p.isActive ? "Active" : "Hidden"}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/products/${p.id}`} className="text-[var(--brand)] underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
