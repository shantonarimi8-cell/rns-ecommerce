"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "../../components/ui/Container";
import type { SerializedOrder } from "../../lib/orders";

function formatShortDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-BD", { dateStyle: "medium" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    fetch("/api/orders").then(async (res) => {
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (res.ok) setOrders(await res.json());
    });
  }, []);

  if (needsLogin) {
    return (
      <Container className="py-10">
        <p>Please login to view orders.</p>
        <Link href="/login" className="underline">
          Login
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">My orders</h1>
      <p className="mt-2 text-gray-600">View full details and print a copy of any order.</p>
      <div className="mt-6 space-y-4">
        {orders.length === 0 && <p className="text-gray-600">No orders yet.</p>}
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">
                  <Link href={`/orders/${order.id}`} className="hover:text-[var(--brand)]">
                    Order #RNS-{order.id}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-gray-500">{formatShortDate(order.createdAt)}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{order.status}</span>
            </div>
            {order.couponCode && (
              <p className="mt-2 text-sm text-green-700">
                Coupon {order.couponCode} · saved ৳{order.discountAmount.toLocaleString("en-BD")}
              </p>
            )}
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.slice(0, 4).map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>
                    {item.productName} ({item.variantLabel}) × {item.quantity}
                  </span>
                  <span>৳{(item.unitPrice * item.quantity).toLocaleString("en-BD")}</span>
                </li>
              ))}
              {order.items.length > 4 && (
                <li className="text-gray-500">+ {order.items.length - 4} more item(s)</li>
              )}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <p className="font-bold">Total: ৳{order.total.toLocaleString("en-BD")}</p>
              <Link
                href={`/orders/${order.id}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                View &amp; print
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
