// lib/auth.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";

const PrismaCredentialsAdapter: Adapter = {
  // Users
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data }) as unknown as any;
  },
  async getUser(id: string) {
    return prisma.user.findUnique({ where: { id } }) as unknown as any;
  },
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } }) as unknown as any;
  },
  async getUserByAccount() {
    // Not used for Credentials-only auth (no OAuth accounts)
    return null;
  },
  async updateUser(data: Prisma.UserUpdateInput & { id: string }) {
    const { id, ...rest } = data as any;
    return prisma.user.update({ where: { id }, data: rest }) as unknown as any;
  },
  async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    return undefined as unknown as any;
  },

  // Accounts (OAuth) — not used in Credentials flow; no-ops
  async linkAccount() {
    return undefined as unknown as any;
  },
  async unlinkAccount() {
    return undefined as unknown as any;
  },

  // Sessions
  async createSession(data: Prisma.SessionCreateInput) {
    return prisma.session.create({ data }) as unknown as any;
  },
  async getSessionAndUser(sessionToken: string) {
    const session = await prisma.session.findUnique({ where: { sessionToken } });
    if (!session) return null as unknown as any;
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return null as unknown as any;
    return { session, user } as unknown as any;
  },
  async updateSession(
    data: Prisma.SessionUpdateInput & { sessionToken: string }
  ) {
    const { sessionToken, ...rest } = data as any;
    return prisma.session.update({ where: { sessionToken }, data: rest }) as unknown as any;
  },
  async deleteSession(sessionToken: string) {
    await prisma.session.delete({ where: { sessionToken } });
    return undefined as unknown as any;
  },

  // Email verification (not used; you can wire these if you add Email provider)
  async createVerificationToken() {
    throw new Error("createVerificationToken not implemented");
  },
  async useVerificationToken() {
    throw new Error("useVerificationToken not implemented");
  },

  // Optional account helpers (not used)
  async getAccount() {
    return null as unknown as any;
  },
  async updateAccount() {
    return null as unknown as any;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaCredentialsAdapter,
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, password: true },
        });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        (session.user as any).id =
          (user as any)?.id ?? token?.sub ?? (session as any)?.user?.id;
      }
      return session;
    },
  },
};

export const { auth } = NextAuth(authOptions);
