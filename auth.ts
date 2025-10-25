// auth.ts
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "./app/api/auth/auth-options";

export async function auth() {
  return getServerSession(authOptions as NextAuthOptions);
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
