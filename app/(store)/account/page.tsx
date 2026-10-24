"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      const data = await res.json();
      if (!data.user) return;
      setName(data.user.name);
      setPhone(data.user.phone ?? "");
      setEmail(data.user.email);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setMessage(res.ok ? "Profile updated" : "Update failed");
  };

  return (
    <Container className="max-w-lg py-8">
      <h1 className="text-3xl font-bold">My account</h1>
      <form onSubmit={save} className="mt-6 space-y-3 rounded-xl border bg-white p-5">
        <input className="w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input className="w-full rounded border bg-gray-50 px-3 py-2" value={email} disabled />
        <input className="w-full rounded border px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        {message && <p className="text-sm text-green-700">{message}</p>}
        <Button type="submit">Save profile</Button>
      </form>
      <Link href="/account/addresses" className="mt-4 inline-block text-[var(--brand)] underline">
        Manage addresses →
      </Link>
    </Container>
  );
}
