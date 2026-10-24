"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
  orderCount: number;
  addressCount: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/admin/customers").then(async (r) => r.ok && setCustomers(await r.json()));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Customers</h1>
      <table className="mt-6 w-full rounded-xl border bg-white text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Addresses</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.name}</td>
              <td>{c.email}</td>
              <td>{c.orderCount}</td>
              <td>{c.addressCount}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/customers/${c.id}`} className="text-[var(--brand)] underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
