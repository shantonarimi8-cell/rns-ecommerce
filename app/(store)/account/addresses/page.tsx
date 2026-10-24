"use client";

import { useEffect, useState } from "react";
import { Container } from "../../../components/ui/Container";
import { Button } from "../../../components/ui/Button";

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    isDefault: false,
  });

  const load = () => {
    fetch("/api/account/addresses").then(async (res) => {
      if (res.ok) setAddresses(await res.json());
    });
  };

  useEffect(load, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ label: "Home", line1: "", line2: "", city: "", region: "", postalCode: "", isDefault: false });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <Container className="max-w-2xl py-8">
      <h1 className="text-3xl font-bold">Saved addresses</h1>

      <div className="mt-6 space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">
              {a.label} {a.isDefault && <span className="text-xs text-[var(--brand)]">(default)</span>}
            </p>
            <p className="text-sm text-gray-600">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}
            </p>
            <button type="button" onClick={() => remove(a.id)} className="mt-2 text-sm text-red-600 underline">
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-8 space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Add address</h2>
        {(["label", "line1", "line2", "city", "region", "postalCode"] as const).map((field) => (
          <input
            key={field}
            className="w-full rounded border px-3 py-2 capitalize"
            placeholder={field}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          Set as default
        </label>
        <Button type="submit">Save address</Button>
      </form>
    </Container>
  );
}
