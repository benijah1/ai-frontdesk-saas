// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// ---- Prisma singleton to avoid hot-reload leaks in dev ----
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query"], // uncomment if you want query logs
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---- Providers: include OAuth only if env vars are present ----
const providers = [
  CredentialsProvider({
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

      return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined };
    },
  }),
];

// Conditionally push OAuth providers if configured
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // v4 supports "jwt" or "database". Use "database" to match your Session model.
  session: { strategy: "database" },
  providers,
  // Use v4 env var names:
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: custom pages (uncomment if you have them)
  // pages: {
  //   signIn: "/signin",
  // },
  callbacks: {
    async session({ session, user }) {
      // Ensure session.user.id exists when using database strategy
      if (session?.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role ?? "USER";
        (session.user as any).tenantId = (user as any).tenantId ?? null;
      }
      return session;
    },
  },
};

// Next.js App Router route handlers (v14)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Prisma + bcrypt need Node runtime, not Edge
export const runtime = "nodejs";
