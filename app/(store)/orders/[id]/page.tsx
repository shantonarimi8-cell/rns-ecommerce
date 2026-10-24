"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderReceipt } from "../../../components/orders/OrderReceipt";
import { Container } from "../../../components/ui/Container";
import type { SerializedOrder } from "../../../lib/orders";

export default function StoreOrderDetailPage() {
  const params = useParams();
  const id = params.id;

  const [order, setOrder] = useState<SerializedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(async (r) => {
      if (r.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!r.ok) {
        setError("Order not found");
        return;
      }
      setOrder(await r.json());
    }).finally(() => setLoading(false));
  }, [id]);

  if (needsLogin) {
    return (
      <Container className="py-10">
        <p>Please login to view this order.</p>
        <Link href="/login" className="underline">
          Login
        </Link>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-10">
        <p className="text-gray-600">Loading order…</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-10">
        <p className="text-red-600">{error || "Could not load order"}</p>
        <Link href="/orders" className="mt-4 inline-block text-[var(--brand)] underline">
          Back to my orders
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <OrderReceipt
        order={order}
        toolbar={
          <Link href="/orders" className="text-sm text-gray-600 hover:text-[var(--brand)]">
            ← My orders
          </Link>
        }
      />
    </Container>
  );
}
