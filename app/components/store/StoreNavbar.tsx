"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../../cart-context";
import { Container } from "../ui/Container";

const categories = [
  { name: "Men", href: "/products?category=men" },
  { name: "Women", href: "/products?category=women" },
  { name: "Kids", href: "/products?category=kids" },
  { name: "Bracelets", href: "/products?category=bracelets" },
  { name: "Watches", href: "/products?category=watches" },
  { name: "Perfume", href: "/products?category=perfume" },
  { name: "Bags", href: "/products?category=bags" },
];

type SessionUser = { id: number; name: string; email: string };

export function StoreNavbar() {
  const { cart } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        setUser(data.user);
      } catch {
        /* ignore */
      }
    }
    loadUser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const text = search.trim();
    router.push(text ? `/products?search=${encodeURIComponent(text)}` : "/products");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="store-nav border-b border-gray-200 bg-white print:hidden">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="text-2xl font-bold text-[var(--brand)]">
          RNS
        </Link>

        <form onSubmit={handleSearch} className="order-3 flex w-full md:order-none md:w-auto md:flex-1 md:px-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-l-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/account" className="font-medium text-black">
                Hi, {user.name.split(" ")[0]}
              </Link>
              <Link href="/wishlist" className="text-black">
                Wishlist
              </Link>
              <button type="button" onClick={handleLogout} className="text-gray-600 underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
          <Link href="/orders">Orders</Link>
          <Link href="/cart" className="relative font-semibold">
            Cart
            <span className="ml-1 rounded-full bg-black px-2 py-0.5 text-xs text-white">
              {totalItems}
            </span>
          </Link>
        </div>
      </Container>

      <nav className="border-t border-gray-100">
        <Container className="flex gap-4 overflow-x-auto py-2 text-sm">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="whitespace-nowrap hover:text-[var(--brand)]">
              {cat.name}
            </Link>
          ))}
        </Container>
      </nav>
    </header>
  );
}
