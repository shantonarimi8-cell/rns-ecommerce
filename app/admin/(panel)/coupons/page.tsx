"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: number;
  code: string;
  type: string;
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "10", minSubtotal: "", maxUses: "" });

  const load = () => fetch("/api/admin/coupons").then(async (r) => r.ok && setItems(await r.json()));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Coupons</h1>
      <form onSubmit={create} className="mt-4 flex flex-wrap gap-2 rounded-xl border bg-white p-4">
        <input className="rounded border px-2 py-1" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="rounded border px-2 py-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>
        <input className="rounded border px-2 py-1" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <button className="rounded bg-[var(--brand)] px-3 py-1 text-white">Add</button>
      </form>
      <table className="mt-6 w-full rounded-xl border bg-white text-sm">
        <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">Code</th><th>Type</th><th>Value</th><th>Used</th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2 font-mono">{c.code}</td>
              <td>{c.type}</td>
              <td>{c.value}</td>
              <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
