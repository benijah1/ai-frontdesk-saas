// lib/auth.ts (NextAuth v4)
import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // keep JWT sessions (works well on Vercel)
  providers: [
    // Remove providers you don't use. These require env vars set in Vercel.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.password) return null;
        const ok = await compare(credentials.password, user.password);
        return ok ? { id: user.id, email: user.email, name: user.name ?? "" } : null;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in", // adjust if your sign-in route differs
  },
  // callbacks: { ... } // add if you need custom JWT/session shaping
};

// Convenience in server components/routes:
export const getSession = () => getServerSession(authOptions);
