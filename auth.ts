// auth.ts
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "./app/api/auth/auth-options";
import NextAuth from "next-auth";

export const { auth, signIn, signOut } = NextAuth({
  // pages: { signIn: "/login" }, // if you use a custom login page
  trustHost: true,               // important on Vercel preview/prod
  session: { strategy: "jwt" },  // typical for v5 app router
  callbacks: {
    async session({ session, token }) {
      // add any custom fields (tenantId, role, etc.)
      if (token) (session as any).userId = token.sub;
      return session;
    },
  },
});

export async function auth() {
  return getServerSession(authOptions as NextAuthOptions);
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
