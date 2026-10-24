"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
  lowStockVariantCount: number;
  recentOrders: { id: number; customerName: string; total: number; status: string }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats").then(async (res) => {
      if (res.status === 403) {
        setDenied(true);
        return;
      }
      if (res.ok) setStats(await res.json());
    });
  }, []);

  if (denied) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="text-gray-600">Your admin session has expired or is not authorised.</p>
        <Link href="/admin/login" className="underline">Go to admin sign in</Link>
      </div>
    );
  }

  if (!stats) return <p>Loading dashboard...</p>;

  const cards = [
    { label: "Revenue", value: `৳${stats.revenue}` },
    { label: "Orders", value: stats.orderCount },
    { label: "Products", value: stats.productCount },
    { label: "Customers", value: stats.userCount },
    { label: "Low stock variants", value: stats.lowStockVariantCount },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-[var(--brand)] underline">
            View all
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2">#RNS-{o.id}</td>
                <td>{o.customerName}</td>
                <td>{o.status}</td>
                <td className="text-right">৳{o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
