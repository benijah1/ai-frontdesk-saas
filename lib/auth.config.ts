// lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// import your providers here (GitHub/Google/Credentials/etc)
import GitHub from "next-auth/providers/github"; // example

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Replace with your real providers and env vars
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // optional: add callbacks/pages as you need
} satisfies NextAuthConfig;
