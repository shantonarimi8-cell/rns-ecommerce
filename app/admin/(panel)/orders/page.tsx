"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SerializedOrder } from "../../../lib/orders";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

function formatShortDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-BD", { dateStyle: "medium" });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<SerializedOrder[]>([]);

  const load = () => fetch("/api/admin/orders").then(async (r) => r.ok && setOrders(await r.json()));
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-2 text-gray-600">Open an order for the full receipt and print-friendly view.</p>

      <div className="mt-6 space-y-4">
        {orders.length === 0 && <p className="text-gray-600">No orders yet.</p>}
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-[var(--brand)]">
                    Order #RNS-{order.id}
                  </Link>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {order.customerName} · {order.customerPhone}
                </p>
                <p className="text-sm text-gray-500">{formatShortDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                >
                  Details &amp; print
                </Link>
              </div>
            </div>

            <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-700">
              {order.items.slice(0, 3).map((item) => (
                <li key={item.id}>
                  {item.productName} ({item.variantLabel}) × {item.quantity}
                </li>
              ))}
              {order.items.length > 3 && (
                <li className="text-gray-500">+ {order.items.length - 3} more item(s)</li>
              )}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              {order.couponCode ? (
                <span className="text-green-700">Coupon: {order.couponCode}</span>
              ) : (
                <span />
              )}
              <p className="font-bold text-gray-900">Total: ৳{order.total.toLocaleString("en-BD")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
