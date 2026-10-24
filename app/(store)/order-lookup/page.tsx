"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";

function LookupInner() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("orderId") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<{
    id: number;
    status: string;
    total: number;
    deliveryAddress: string;
    items: { productName: string; variantLabel: string; quantity: number }[];
  } | null>(null);
  const [error, setError] = useState("");

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: Number(orderId), email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Not found");
      return;
    }
    setOrder(data);
  };

  return (
    <Container className="max-w-lg py-10">
      <h1 className="text-3xl font-bold">Track guest order</h1>
      <form onSubmit={lookup} className="mt-6 space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="Order ID (number)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Email used at checkout" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit">Track</Button>
      </form>

      {order && (
        <div className="mt-8 rounded-xl border bg-white p-5">
          <p className="font-bold">Order #RNS-{order.id}</p>
          <p className="text-sm">Status: {order.status}</p>
          <p className="mt-2 text-sm text-gray-600">{order.deliveryAddress}</p>
          <ul className="mt-3 text-sm">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.productName} ({item.variantLabel}) × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-bold">Total: ৳{order.total}</p>
        </div>
      )}
    </Container>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense>
      <LookupInner />
    </Suspense>
  );
}
