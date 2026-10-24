"use client";

import { useEffect, useState } from "react";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", sortOrder: "0" });

  const load = () => fetch("/api/admin/banners").then(async (r) => r.ok && setItems(await r.json()));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Homepage banners</h1>
      <form onSubmit={create} className="mt-4 grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-2">
        <input className="rounded border px-2 py-1" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="rounded border px-2 py-1" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input className="rounded border px-2 py-1" placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        <button className="rounded bg-[var(--brand)] px-3 py-1 text-white">Add banner</button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((b) => (
          <div key={b.id} className="flex gap-4 rounded-xl border bg-white p-3">
            <img src={b.imageUrl} alt="" className="h-20 w-32 rounded object-cover" />
            <div>
              <p className="font-semibold">{b.title}</p>
              <p className="text-sm text-gray-600">{b.subtitle}</p>
              <p className="text-xs text-gray-500">{b.linkUrl}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
