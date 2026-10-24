"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/login");
  };

  return (
    <Container className="max-w-md py-12">
      <h1 className="text-3xl font-bold">Create account</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit">Register</Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login" className="text-[var(--brand)] underline">Login</Link>
      </p>
    </Container>
  );
}
