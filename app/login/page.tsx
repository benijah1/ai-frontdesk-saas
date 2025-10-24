// app/login/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoginFormClient from "./LoginFormClient";

// Keep this page dynamic so it never gets statically prerendered
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type PageProps = {
  searchParams?: { callbackUrl?: string };
};

export default async function LoginPage({ searchParams }: PageProps) {
  const callbackUrl = searchParams?.callbackUrl || "/dashboard";

  // Detect existing Auth.js / NextAuth session cookies (covers v4 + v5, secure/non-secure)
  const jar = cookies();
  const hasSession =
    jar.has("next-auth.session-token") ||
    jar.has("__Secure-next-auth.session-token") ||
    jar.has("authjs.session-token") ||
    jar.has("__Secure-authjs.session-token");

  if (hasSession) {
    redirect(callbackUrl);
  }

  // Not authenticated — render the client login form
  return <LoginFormClient callbackUrl={callbackUrl} />;
}
