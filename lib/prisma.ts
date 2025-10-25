// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * In dev, keep a single PrismaClient instance across HMR reloads.
 * In prod, create a new instance per process.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // You can enable query logging if needed:
    // log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
