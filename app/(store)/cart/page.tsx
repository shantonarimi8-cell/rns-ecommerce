"use client";

import Link from "next/link";
import { Container } from "../../components/ui/Container";
import { ButtonLink } from "../../components/ui/Button";
import { useCart } from "../../cart-context";

export default function CartPage() {
  const { cart, removeFromCart, setQuantity, subtotal } = useCart();

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">Your cart</h1>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-8 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <ButtonLink href="/products" className="mt-4">
            Continue shopping
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.variantId} className="flex gap-4 rounded-xl border bg-white p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.productId}`} className="font-semibold hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600">{item.variantLabel}</p>
                  <p className="mt-1 font-bold">৳{item.price}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded border"
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="h-8 w-8 rounded border"
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-4 text-sm text-red-600 underline"
                      onClick={() => removeFromCart(item.variantId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-bold">৳{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-2xl font-bold">৳{subtotal}</p>
            <ButtonLink href="/checkout" className="mt-4 w-full">
              Proceed to checkout
            </ButtonLink>
          </aside>
        </div>
      )}
    </Container>
  );
}
