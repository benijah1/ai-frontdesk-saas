'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
    if (!res || res.error) setErr(res?.error || "Invalid credentials");
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm">Password</span>
            <input
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 font-semibold bg-blue-600 text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">or</div>

        <div className="space-y-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-md px-3 py-2 border"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full rounded-md px-3 py-2 border"
          >
            Continue with GitHub
          </button>
          <button
            onClick={() => signIn("email", { email, callbackUrl: "/dashboard" })}
            className="w-full rounded-md px-3 py-2 border"
          >
            Email me a magic link
          </button>
        </div>

        <p className="text-sm text-slate-600 text-center">
          New here? <Link className="text-blue-600 underline" href="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
