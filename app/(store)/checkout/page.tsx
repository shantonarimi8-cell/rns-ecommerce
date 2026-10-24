"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../cart-context";

type Address = {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [user, setUser] = useState<{ id: number; name: string; email: string; phone: string | null } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | "">("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [placedId, setPlacedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();
      if (me.user) {
        setUser(me.user);
        setName(me.user.name);
        setEmail(me.user.email);
        setPhone(me.user.phone ?? "");
        const addrRes = await fetch("/api/account/addresses");
        if (addrRes.ok) {
          const list = await addrRes.json();
          setAddresses(list);
          const def = list.find((a: Address) => a.isDefault) ?? list[0];
          if (def) setAddressId(def.id);
        }
      }
    }
    load();
  }, []);

  const applyCoupon = async () => {
    setCouponMessage("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDiscount(0);
      setCouponMessage(data.error || "Invalid coupon");
      return;
    }
    setDiscount(data.discount);
    setCouponMessage(`Applied ${data.code}: -৳${data.discount}`);
  };

  const total = Math.max(0, subtotal - discount);

  const placeOrder = async () => {
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        couponCode: couponCode || undefined,
        paymentMethod: "Cash on Delivery",
        items: cart.map((c) => ({ variantId: c.variantId, quantity: c.quantity })),
        saveAddress: user ? saveAddress : false,
      };

      if (user && addressId) {
        body.addressId = addressId;
      } else {
        body.line1 = line1;
        body.line2 = line2;
        body.city = city;
        body.region = region;
        body.postalCode = postalCode;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }
      clearCart();
      setPlacedId(data.id);
      router.push(`/checkout/success?orderId=${data.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !placedId) {
    return (
      <Container className="py-10">
        <p>Your cart is empty.</p>
        <Link href="/products" className="underline">
          Shop products
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-gray-600">Cash on Delivery · Guest or account checkout</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Contact & delivery</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded border px-3 py-2 md:col-span-2" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded border px-3 py-2" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded border px-3 py-2" />
            </div>

            {user && addresses.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Saved address</label>
                <select
                  value={addressId}
                  onChange={(e) => setAddressId(Number(e.target.value))}
                  className="mt-1 w-full rounded border px-3 py-2"
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}: {a.line1}, {a.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(!user || !addressId) && (
              <div className="mt-4 grid gap-3">
                <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Address line 1" className="rounded border px-3 py-2" />
                <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Address line 2 (optional)" className="rounded border px-3 py-2" />
                <div className="grid gap-3 md:grid-cols-3">
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded border px-3 py-2" />
                  <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="rounded border px-3 py-2" />
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="rounded border px-3 py-2" />
                </div>
              </div>
            )}

            {user && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Save this address to my account
              </label>
            )}
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Coupon</h2>
            <div className="mt-3 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="flex-1 rounded border px-3 py-2 uppercase"
              />
              <Button type="button" variant="secondary" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponMessage && <p className="mt-2 text-sm text-green-700">{couponMessage}</p>}
          </section>
        </div>

        <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {cart.map((item) => (
              <li key={item.variantId} className="flex justify-between gap-2">
                <span>
                  {item.name} ({item.variantLabel}) × {item.quantity}
                </span>
                <span>৳{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-৳{discount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total (COD)</span>
              <span>৳{total}</span>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button className="mt-4 w-full" onClick={placeOrder} disabled={loading}>
            {loading ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </div>
    </Container>
  );
}
