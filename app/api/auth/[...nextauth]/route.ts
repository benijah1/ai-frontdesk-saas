// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

// --- Prisma singleton (avoids hot-reload leaks) ---
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query"], // uncomment if you want to see queries
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- Providers (conditionally include OAuth only if env exists) ---
const oauthProviders = [
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    : null,
  process.env.GITHUB_ID && process.env.GITHUB_SECRET
    ? GitHub({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
      })
    : null,
].filter(Boolean);

// --- Credentials (email + password) ---
const credentialsProvider = Credentials({
  name: "Email & Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (creds) => {
    const email = (creds?.email || "").toString().toLowerCase().trim();
    const password = (creds?.password || "").toString();

    if (!email || !password) return null;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    // NextAuth v5 expects a plain object with id at minimum
    return { id: user.id, email: user.email, name: user.name ?? undefined };
  },
});

// --- Auth config ---
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    // Use database sessions to match your schema
    strategy: "database",
  },
  // If you only want Credentials for now, keep just [credentialsProvider].
  providers: [credentialsProvider, ...oauthProviders] as any,
  pages: {
    // Optional: provide a custom sign-in page
    // signIn: "/signin",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET, // REQUIRED in production
  // You can use callbacks to enrich session/user if needed
  callbacks: {
    async session({ session, user, token }) {
      // Ensure session.user.id is present when using database sessions
      if (session?.user && user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  // Explicitly use node runtime (Prisma + bcrypt)
  // @ts-ignore - Next.js route export
  experimental: { enableWebAuthn: false },
} satisfies NextAuthConfig;

// --- Export route handlers ---
export const { GET, POST } = NextAuth(authConfig);

// Next.js can infer this, but it's safer to pin node runtime for Prisma
export const runtime = "nodejs";
