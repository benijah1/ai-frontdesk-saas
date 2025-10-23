// lib/auth.ts (sessions section — drop-in replacement)

import type { Adapter, AdapterSession } from "next-auth/adapters"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const adapter: Adapter = {
  // ... keep your existing user/account methods here ...

  // Sessions
  async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
    const s = await prisma.session.create({
      data: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      },
    })
    // Return shape must satisfy AdapterSession
    return {
      sessionToken: s.sessionToken,
      userId: s.userId,
      expires: s.expires,
    }
  },

  async getSessionAndUser(sessionToken: string) {
    const s = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })
    if (!s) return null
    const { user, ...sess } = s
    return {
      session: {
        sessionToken: sess.sessionToken,
        userId: sess.userId,
        expires: sess.expires,
      },
      user, // Prisma User maps 1:1 to AdapterUser for common fields
    }
  },

  async updateSession(session: Partial<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
    // Only update allowed fields; sessionToken is the identifier
    try {
      const s = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: {
          // Only update if provided
          expires: session.expires,
          // userId is rarely changed; omit unless you explicitly support it
        },
      })
      return {
        sessionToken: s.sessionToken,
        userId: s.userId,
        expires: s.expires,
      }
    } catch {
      return null
    }
  },

  async deleteSession(sessionToken: string): Promise<void> {
    // Use deleteMany to be tolerant if it doesn't exist
    await prisma.session.deleteMany({ where: { sessionToken } })
  },

  // If your Adapter interface requires the rest, keep your existing implementations:
  // createUser, getUser, getUserByEmail, getUserByAccount, updateUser, linkAccount, unlinkAccount, etc.
}
