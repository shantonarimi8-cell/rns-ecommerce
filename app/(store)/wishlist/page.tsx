"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "../../components/ui/Container";
import { ProductCard } from "../../components/store/ProductCard";

type Product = {
  id: number;
  name: string;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist").then(async (res) => {
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (res.ok) setItems(await res.json());
    });
  }, []);

  const remove = async (productId: number) => {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((current) => current.filter((p) => p.id !== productId));
  };

  if (needsLogin) {
    return (
      <Container className="py-10">
        <p>Login to view wishlist.</p>
        <Link href="/login" className="underline">Login</Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-gray-600">No saved items.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <div key={p.id}>
              <ProductCard {...p} />
              <button type="button" onClick={() => remove(p.id)} className="mt-2 w-full text-sm text-red-600 underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
