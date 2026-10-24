"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/ui/Container";
import { ProductCard } from "../../components/store/ProductCard";

type Product = {
  id: number;
  name: string;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  categoryName: string;
};

function ProductsInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (inStockOnly) params.set("inStock", "1");
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) setProducts(await res.json());
      setLoading(false);
    }
    load();
  }, [category, search, minPrice, maxPrice, sort, inStockOnly]);

  let title = "All products";
  if (search) title = `Search: ${search}`;
  else if (category) title = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Container className="py-8">
      <nav className="mb-2 text-sm text-gray-500">
        <Link href="/">Home</Link> / <span>{title}</span>
      </nav>
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
          <p className="font-semibold">Filters</p>
          <label className="mt-3 block text-sm">
            Min price
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1"
              inputMode="numeric"
            />
          </label>
          <label className="mt-3 block text-sm">
            Max price
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1"
              inputMode="numeric"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            In stock only
          </label>
          <label className="mt-4 block text-sm">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </aside>

        <div>
          {loading && <p className="text-gray-600">Loading...</p>}
          {!loading && products.length === 0 && (
            <p className="text-gray-600">No products match your filters.</p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Container className="py-8">Loading...</Container>}>
      <ProductsInner />
    </Suspense>
  );
}
