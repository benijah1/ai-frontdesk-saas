// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  const [email, setEmail] = useState("");

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-xl border border-white/10 bg-[#0b0f17]/60 p-6 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-center text-2xl font-semibold text-white">
          Sign in
        </h1>
        <p className="mb-6 text-center text-sm text-white/70">
          Use your email or a connected provider.
        </p>

        {/* OAuth providers (show only what you use; these are safe calls if configured) */}
        <div className="grid gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="h-10 w-full rounded-md border border-white/15 px-3 text-sm text-white/90 transition hover:border-white/25 hover:text-white"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="h-10 w-full rounded-md border border-white/15 px-3 text-sm text-white/90 transition hover:border-white/25 hover:text-white"
          >
            Continue with GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/50">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email (magic link) — requires Email provider in NextAuth */}
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            signIn("email", { email, callbackUrl });
          }}
        >
          <label className="text-sm text-white/80">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1 h-10 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-white/90 placeholder-white/30 outline-none ring-0 focus:border-white/25"
            />
          </label>
          <button
            type="submit"
            className="mt-1 h-10 rounded-md bg-white/90 text-sm font-medium text-black transition hover:bg-white"
          >
            Email me a magic link
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline hover:text-white">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
