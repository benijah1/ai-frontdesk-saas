// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// ---- Prisma singleton (no exports!) ----
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query"], // enable if wanted
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---- Providers ----
const providers = [
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (creds) => {
      const email = (creds?.email || "").toLowerCase().trim();
      const password = String(creds?.password || "");
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return null;

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return null;

      // Return minimal shape; adapter will load the rest
      return {
        id: user.id,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }) as any
  );
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }) as any
  );
}

// ---- NextAuth options (no export!) ----
const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database", // uses your "Session" table
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Keep users on /login for sign-in and error states
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  secret: process.env.NEXTAUTH_SECRET, // v4 env var
  callbacks: {
    async session({ session, user }) {
      // Enrich session with id/role/tenantId for your app
      if (session?.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role ?? "USER";
        (session.user as any).tenantId = (user as any).tenantId ?? null;
      }
      return session;
    },
  },
};

// ---- Route handler exports (only GET/POST + runtime) ----
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Prisma + bcrypt require Node runtime
export const runtime = "nodejs";
