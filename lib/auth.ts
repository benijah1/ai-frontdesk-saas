import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "database"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name || undefined };
      }
    })
  ],
  pages: {
    signIn: "/sign-in"
  },
  callbacks: {
    async session({ session, token, user }) {
      // next-auth with database sessions: 'user' is available when using Prisma adapter;
      // we keep minimal shape
      return session;
    }
  },
  adapter: {
    async createUser(data) { return prisma.user.create({ data }) as any; },
    async getUser(id) { return prisma.user.findUnique({ where: { id } }) as any; },
    async getUserByEmail(email) { return prisma.user.findUnique({ where: { email } }) as any; },
    async getUserByAccount() { return null; },
    async updateUser(data) { return prisma.user.update({ where: { id: data.id! }, data }) as any; },
    async deleteUser(id) { await prisma.user.delete({ where: { id } }); },
    async linkAccount() { return; },
    async unlinkAccount() { return; },
    async createSession(data) { return prisma.session.create({ data }) as any; },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({ where: { sessionToken } });
      if (!session) return null as any;
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return null as any;
      return { session, user } as any;
    },
    async updateSession(data) {
      return prisma.session.update({ where: { sessionToken: data.sessionToken! }, data }) as any;
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },
    async createVerificationToken() { throw new Error("not implemented"); },
    async useVerificationToken() { throw new Error("not implemented"); },
    async getAccount() { return null as any; },
    async updateAccount() { return null as any; }
  } as any
};

export const { auth } = NextAuth(authOptions);
