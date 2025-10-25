// auth.ts
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

export async function auth() {
  // NextAuth v4: wrap getServerSession for v5-like usage
  return getServerSession(authOptions as NextAuthOptions);
}

// (optional) convenience: strongly-typed current user accessor
export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
