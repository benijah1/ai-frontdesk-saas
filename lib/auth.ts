// lib/auth.ts

import { PrismaClient } from "@prisma/client"
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

/**
 * Prisma singleton to avoid multiple instances during dev/hot reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/**
 * Helpers to map Prisma entities to NextAuth adapter types.
 * Note: Some NextAuth versions type AdapterUser.email as `string` (not nullable).
 * To satisfy both, we return a string fallback ("") when DB email is null.
 */
function toAdapterUser(u: {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
}): AdapterUser {
  return {
    id: u.id,
    name: u.name ?? null,
    // If your AdapterUser.email is `string`, this satisfies it.
    // If it's `string | null`, returning "" is still assignable.
    email: (u.email ?? "").toLowerCase(),
    emailVerified: u.emailVerified,
    image: u.image ?? null,
  } as AdapterUser
}

function toAdapterAccount(a: {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  oauth_token_secret: string | null
  oauth_token: string | null
}): AdapterAccount {
  return {
    id: a.id,
    userId: a.userId,
    type: a.type,
    provider: a.provider,
    providerAccountId: a.providerAccountId,
    refresh_token: a.refresh_token ?? null,
    access_token: a.access_token ?? null,
    expires_at: a.expires_at ?? null,
    token_type: a.token_type ?? null,
    scope: a.scope ?? null,
    id_token: a.id_token ?? null,
    session_state: a.session_state ?? null,
    oauth_token_secret: a.oauth_token_secret ?? null,
    oauth_token: a.oauth_token ?? null,
  }
}

function toAdapterSession(s: {
  sessionToken: string
  userId: string
  expires: Date
}): AdapterSession {
  return {
    sessionToken: s.sessionToken,
    userId: s.userId,
    expires: s.expires,
  }
}

/**
 * Fully implemented custom NextAuth Adapter using Prisma, with strict typing.
 */
export const adapter: Adapter = {
  // ---------- USER ----------
  async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
    const created = await prisma.user.create({
      data: {
        name: user.name ?? null,
        // Store as-is (nullable) in DB; we normalize to string in the mapper.
        email: user.email ? user.email.toLowerCase() : null,
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
      },
    })
    return toAdapterUser(created)
  },

  async getUser(id: string): Promise<AdapterUser | null> {
    const u = await prisma.user.findUnique({ where: { id } })
    return u ? toAdapterUser(u) : null
  },

  async getUserByEmail(email: string | null | undefined): Promise<AdapterUser | null> {
    if (!email) return null
    const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    return u ? toAdapterUser(u) : null
  },

  async getUserByAccount(params: { provider: string; providerAccountId: string }): Promise<AdapterUser | null> {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
        },
      },
      include: { user: true },
    })
    return account?.user ? toAdapterUser(account.user) : null
  },

  async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name ?? undefined,
        email: user.email ? user.email.toLowerCase() : undefined,
        emailVerified: user.emailVerified ?? undefined,
        image: user.image ?? undefined,
      },
    })
    return toAdapterUser(updated)
  },

  async deleteUser(userId: string): Promise<void> {
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
  },

  // ---------- ACCOUNT ----------
  async linkAccount(account: AdapterAccount): Promise<AdapterAccount | null | undefined> {
    const created = await prisma.account.create({
      data: {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
        oauth_token_secret: account.oauth_token_secret ?? null,
        oauth_token: account.oauth_token ?? null,
      },
    })
    return toAdapterAccount(created)
  },

  async unlinkAccount(params: { provider: string; providerAccountId: string }): Promise<void> {
    await prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
        },
      },
    })
  },

  // ---------- SESSION ----------
  async createSession(session: Omit<AdapterSession, "id">): Promise<AdapterSession> {
    const s = await prisma.session.create({
      data: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      },
    })
    return toAdapterSession(s)
  },

  async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    const s = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })
    if (!s) return null
    return {
      session: toAdapterSession(s),
      user: toAdapterUser(s.user),
    }
  },

  async updateSession(
    session: Partial<AdapterSession> & { sessionToken: string }
  ): Promise<AdapterSession | null> {
    try {
      const s = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: {
          expires: session.expires ?? undefined,
          userId: session.userId ?? undefined,
        },
      })
      return toAdapterSession(s)
    } catch {
      return null
    }
  },

  async deleteSession(sessionToken: string): Promise<void> {
    await prisma.session.deleteMany({ where: { sessionToken } })
  },

  // ---------- VERIFICATION TOKEN ----------
  async createVerificationToken(token: VerificationToken): Promise<VerificationToken> {
    const created = await prisma.verificationToken.create({
      data: {
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      },
    })
    return {
      identifier: created.identifier,
      token: created.token,
      expires: created.expires,
    }
  },

  async useVerificationToken(params: { identifier: string; token: string }): Promise<VerificationToken | null> {
    try {
      const deleted = await prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: params.identifier, token: params.token },
        },
      })
      return {
        identifier: deleted.identifier,
        token: deleted.token,
        expires: deleted.expires,
      }
    } catch {
      return null
    }
  },
}

/**
 * NextAuth options used by getServerSession in app/dashboard/page.tsx.
 * Includes a Credentials provider for basic email-only sign-in during development.
 * Replace or extend providers as needed for your project.
 */
export const authOptions: NextAuthOptions = {
  adapter,
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email Only",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const rawEmail = (credentials?.email ?? "").toString().trim()
        const email = rawEmail ? rawEmail.toLowerCase() : ""
        const displayName = (credentials?.name ?? "").toString().trim() || null
        if (!email) return null

        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: displayName,
            },
          })
        } else if (displayName && user.name !== displayName) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: displayName },
          })
        }

        return {
          id: user.id,
          email: user.email ?? "", // ensure string for the session token typing
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {},
}

export default authOptions
