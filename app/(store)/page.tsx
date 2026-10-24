"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "../components/ui/Container";
import { ProductCard } from "../components/store/ProductCard";
import { ButtonLink } from "../components/ui/Button";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type Product = {
  id: number;
  name: string;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const [bRes, cRes, pRes] = await Promise.all([
        fetch("/api/banners"),
        fetch("/api/categories"),
        fetch("/api/products"),
      ]);
      if (bRes.ok) setBanners(await bRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(Array.isArray(data) ? data.slice(0, 8) : []);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[bannerIndex];

  return (
    <div>
      <section className="bg-gray-100">
        <Container className="py-8 md:py-12">
          {activeBanner ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                className="h-56 w-full object-cover md:h-80"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
                <h1 className="text-2xl font-bold md:text-4xl">{activeBanner.title}</h1>
                {activeBanner.subtitle && (
                  <p className="mt-2 max-w-xl text-sm md:text-base">{activeBanner.subtitle}</p>
                )}
                {activeBanner.linkUrl && (
                  <Link
                    href={activeBanner.linkUrl}
                    className="mt-4 inline-block w-fit rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                  >
                    Shop collection
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <h1 className="text-3xl font-bold text-black md:text-5xl">Welcome to RNS</h1>
              <p className="mt-3 text-gray-600">Run seed data to load homepage banners.</p>
              <ButtonLink href="/products" className="mt-6">
                Shop now
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <h2 className="text-xl font-bold">Shop by category</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="overflow-hidden rounded-xl border bg-white text-center shadow-sm hover:shadow"
              >
                <div className="aspect-square bg-gray-100">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      {cat.name}
                    </div>
                  )}
                </div>
                <p className="py-2 text-sm font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Featured products</h2>
            <Link href="/products" className="text-sm text-[var(--brand)] underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
