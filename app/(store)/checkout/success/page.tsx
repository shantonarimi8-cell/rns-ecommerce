"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "../../../components/ui/Container";
import { ButtonLink } from "../../../components/ui/Button";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <Container className="py-16 text-center">
      <h1 className="text-3xl font-bold text-green-700">Order placed!</h1>
      <p className="mt-3 text-gray-600">
        Your order ID is <strong>RNS-{orderId}</strong>. Pay cash on delivery when it arrives.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/orders">View my orders</ButtonLink>
        <ButtonLink href={`/order-lookup?orderId=${orderId}`} variant="secondary">
          Guest tracking
        </ButtonLink>
      </div>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
