// app/login/page.tsx
import { redirect } from "next/navigation";

// Keep this page dynamic so it never gets statically prerendered
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type PageProps = {
  searchParams?: { callbackUrl?: string };
};

export default async function LoginPage({ searchParams }: PageProps) {
  const callbackUrl = searchParams?.callbackUrl || "/dashboard";

  // Try NextAuth v5 helper first (`auth()`), then fall back to v4 (`getServerSession`)
  let session: any = null;
  try {
    // NextAuth v5 style: export const { auth } from "@/auth"
    const mod = await import("@/auth").catch(() => null);
    if (mod?.auth) {
      session = await mod.auth();
    }
  } catch {
    // ignore and try v4
  }
  if (!session) {
    try {
      // NextAuth v4 style
      const { getServerSession } = await import("next-auth");
      // Update this import path to wherever your auth options live:
      // e.g. "@/lib/auth" or "@/app/api/auth/[...nextauth]/authOptions"
      const { authOptions } = await import(
        "@/app/api/auth/[...nextauth]/authOptions"
      );
      session = await getServerSession(authOptions);
    } catch {
      // If neither import works, continue unauthenticated
    }
  }

  // If already authenticated, go straight to the callback target
  if (session?.user) redirect(callbackUrl);

  // Otherwise render the client login form
  return <LoginFormClient callbackUrl={callbackUrl} />;
}

// Import the client component from a sibling file to keep this page server-only
import LoginFormClient from "./LoginFormClient";
