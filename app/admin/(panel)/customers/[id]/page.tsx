"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams();
  const [data, setData] = useState<{
    name: string;
    email: string;
    phone: string | null;
    addresses: { label: string; line1: string; city: string }[];
    orders: { id: number; status: string; total: number }[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`).then(async (r) => {
      if (r.ok) setData(await r.json());
    });
  }, [params.id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p className="text-gray-600">{data.email} · {data.phone ?? "—"}</p>

      <h2 className="mt-6 font-semibold">Addresses</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {data.addresses.map((a, i) => (
          <li key={i} className="rounded border bg-white p-3">{a.label}: {a.line1}, {a.city}</li>
        ))}
      </ul>

      <h2 className="mt-6 font-semibold">Orders</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {data.orders.map((o) => (
          <li key={o.id} className="rounded border bg-white p-3">
            <Link href={`/admin/orders/${o.id}`} className="font-medium text-[var(--brand)] hover:underline">
              #RNS-{o.id}
            </Link>{" "}
            · {o.status} · ৳{o.total}
          </li>
        ))}
      </ul>
    </div>
  );
}
