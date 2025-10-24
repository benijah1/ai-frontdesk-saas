// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // <- v4 adapter path
import { prisma } from "@/lib/prisma"; // ensure this exports a singleton PrismaClient

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // --- Google OAuth ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // --- GitHub OAuth ---
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // --- Email Magic Link (optional) ---
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  // You have Session model in Prisma; keep DB sessions
  session: { strategy: "database" },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // expose user.id on the session for the client
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
};

// App Router handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
