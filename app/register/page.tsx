'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const r = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(j.error || "Unable to register");
    r.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded-md px-3 py-2" placeholder="Name"
                 value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="Email" type="email" required
                 value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="Password" type="password" required
                 value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="w-full rounded-md px-3 py-2 font-semibold bg-blue-600 text-white disabled:opacity-60"
                  disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}
