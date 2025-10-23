// lib/auth.ts

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters"
import { PrismaClient } from "@prisma/client"

/**
 * Prisma singleton (avoids creating multiple clients in dev/hot-reload)
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
 * Helper mappers (most Prisma <-> Adapter types align 1:1)
 */
function toAdapterUser(u: any): AdapterUser {
  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email ?? null,
    emailVerified: u.emailVerified,
    image: u.image ?? null,
  }
}

function toAdapterAccount(a: any): AdapterAccount {
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

function toAdapterSession(s: any): AdapterSession {
  return {
    sessionToken: s.sessionToken,
    userId: s.userId,
    expires: s.expires,
  }
}

/**
 * Fully implemented NextAuth Adapter using Prisma
 */
export const adapter: Adapter = {
  /**
   * Users
   */
  async createUser(user) {
    const created = await prisma.user.create({
      data: {
        name: user.name ?? null,
        email: user.email ?? null,
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
      },
    })
    return toAdapterUser(created)
  },

  async getUser(id) {
    const u = await prisma.user.findUnique({ where: { id } })
    return u ? toAdapterUser(u) : null
  },

  async getUserByEmail(email) {
    if (!email) return null
    const u = await prisma.user.findUnique({ where: { email } })
    return u ? toAdapterUser(u) : null
  },

  async getUserByAccount({ provider, providerAccountId }) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    })
    if (!account?.user) return null
    return toAdapterUser(account.user)
  },

  async updateUser(user) {
    const updated = await prisma.user.update({
      where: { id: user.id as string },
      data: {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        emailVerified: user.emailVerified ?? undefined,
        image: user.image ?? undefined,
      },
    })
    return toAdapterUser(updated)
  },

  async deleteUser(userId) {
    // Important: Also clean up relations to avoid orphaned rows in strict schemas
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
  },

  /**
   * Accounts
   */
  async linkAccount(account) {
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

  async unlinkAccount({ provider, providerAccountId }) {
    await prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    })
  },

  /**
   * Sessions
   * These signatures must match NextAuth's expectations.
   */
  async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
    const s = await prisma.session.create({
      data: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      },
    })
    return toAdapterSession(s)
  },

  async getSessionAndUser(sessionToken: string) {
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
          // Only update provided fields; sessionToken is the identifier
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

  /**
   * Email/OTP (verification tokens)
   */
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

  async useVerificationToken(params: {
    identifier: string
    token: string
  }): Promise<VerificationToken | null> {
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
      // If not found, return null (per NextAuth contract)
      return null
    }
  },
}

export default adapter
