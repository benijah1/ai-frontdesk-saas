import { PrismaAdapter } from "@auth/prisma-adapter"
import { type NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import type { ProviderType } from "next-auth/providers"
import type { AdapterAccount } from "next-auth/adapters"

import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) {
          throw new Error("User not found")
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) throw new Error("Invalid password")

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
}

/**
 * Helper to safely map Prisma Account objects to AdapterAccount
 * Fixes TypeScript error: Type 'string' is not assignable to type 'ProviderType'
 */
function prismaAccountToAdapterAccount(a: any): AdapterAccount {
  return {
    id: a.id,
    userId: a.userId,
    type: a.type as ProviderType,
    provider: a.provider,
    providerAccountId: a.providerAccountId,
    refresh_token: a.refresh_token ?? null,
    access_token: a.access_token ?? null,
    expires_at: a.expires_at ?? null,
    token_type: a.token_type ?? null,
    scope: a.scope ?? null,
    id_token: a.id_token ?? null,
    session_state: a.session_state ?? null,
  }
}

// Optional: Example if you have a manual adapter override
export const customAdapter = {
  ...PrismaAdapter(prisma),
  async getUserByAccount(providerAccount) {
    const account = await prisma.account.findFirst({
      where: {
        provider: providerAccount.provider,
        providerAccountId: providerAccount.providerAccountId,
      },
      include: { user: true },
    })
    if (!account) return null
    return prismaAccountToAdapterAccount(account)
  },
}

export const getAuthSession = () => getServerSession(authOptions)
