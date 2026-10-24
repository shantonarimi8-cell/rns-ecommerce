"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminSidebar({ adminName }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <aside className="flex w-full flex-col border-r border-gray-200 bg-gray-900 text-white print:hidden md:min-h-screen md:w-64">
      <div className="border-b border-gray-800 p-4">
        <p className="text-lg font-bold">RNS Admin</p>
        {adminName && <p className="mt-1 truncate text-xs text-gray-400">Signed in as {adminName}</p>}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                active ? "bg-[var(--brand)] font-semibold" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-gray-800 p-3 text-xs">
        <Link href="/" target="_blank" rel="noopener" className="text-gray-400 hover:text-white">
          View store ↗
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-md bg-gray-800 px-3 py-1.5 font-medium text-gray-200 hover:bg-gray-700 disabled:opacity-50"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
