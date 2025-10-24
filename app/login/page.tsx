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

    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if (!res || (res as any)?.error) {
      setErr((res as any)?.error || "Invalid credentials");
      setLoading(false);
    }
  }

  return (
    <main
      data-login
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-gray-900">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              name="password"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-6 text-center text-xs uppercase tracking-wide text-gray-400">
          or
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50"
          >
            Continue with GitHub
          </button>
          <button
            type="button"
            onClick={() => signIn("email", { email, callbackUrl: "/dashboard" })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50"
          >
            Email me a magic link
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <Link className="text-blue-600 underline" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
