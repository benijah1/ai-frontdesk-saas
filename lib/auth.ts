// lib/auth.ts (drop-in)

import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Select only what's needed, including password hash
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, password: true },
        });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // Return the minimal user object for NextAuth
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token, user }) {
      // Ensure session.user.id exists for convenience
      if (session.user) {
        // 'user' is present on initial sign-in; fallback to token.sub otherwise
        (session.user as any).id = (user as any)?.id ?? token?.sub ?? (session as any)?.user?.id;
      }
      return session;
    },
  },
};

export const { auth } = NextAuth(authOptions);
