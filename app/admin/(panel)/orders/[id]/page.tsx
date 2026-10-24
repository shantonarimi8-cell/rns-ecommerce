"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderReceipt } from "../../../../components/orders/OrderReceipt";
import type { SerializedOrder } from "../../../../lib/orders";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id;

  const [order, setOrder] = useState<SerializedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    fetch(`/api/admin/orders/${id}`).then(async (r) => {
      if (!r.ok) {
        setError("Order not found");
        setOrder(null);
        return;
      }
      setOrder(await r.json());
      setError("");
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok && order) {
      setOrder({ ...order, status });
    }
  };

  if (loading) return <p className="text-gray-600">Loading order…</p>;

  if (error || !order) {
    return (
      <div>
        <p className="text-red-600">{error || "Could not load order"}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-[var(--brand)] underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <OrderReceipt
        order={order}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-[var(--brand)]">
              ← All orders
            </Link>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status</span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      />
    </div>
  );
}
