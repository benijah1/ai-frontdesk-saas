"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function mapError(error?: string | null) {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "AccessDenied":
      return "Access denied.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string }
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showError = !!searchParams?.error;
  const errorMsg = showError ? mapError(searchParams?.error) : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard"
    });
    setSubmitting(false);
  }

  return (
    <main
      data-login
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>

        {showError && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Forgot your password?{" "}
          <Link href="/forgot" className="text-sky-700 hover:underline">
            Reset it
          </Link>
        </p>
      </div>
    </main>
  );
}
