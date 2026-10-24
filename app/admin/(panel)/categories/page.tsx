"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "", sortOrder: "0" });

  const load = () => fetch("/api/admin/categories").then(async (r) => r.ok && setItems(await r.json()));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
    });
    setForm({ name: "", slug: "", description: "", imageUrl: "", sortOrder: "0" });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Categories</h1>
      <form onSubmit={create} className="mt-4 grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input className="rounded border px-2 py-1" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded border px-2 py-1" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className="rounded border px-2 py-1" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="rounded bg-[var(--brand)] px-3 py-1 text-white">Add category</button>
      </form>
      <table className="mt-6 w-full rounded-xl border bg-white text-sm">
        <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">Name</th><th>Slug</th><th></th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td>{c.slug}</td>
              <td className="p-2 text-right"><button onClick={() => remove(c.id)} className="text-red-600">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
