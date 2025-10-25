// auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import { authOptions } from "./app/api/auth/auth-options";

/**
 * Merge our local tweaks with whatever is already in authOptions.
 * Compatible with NextAuth v4/v5 when using NextAuthOptions.
 */
const mergedOptions: NextAuthOptions = {
  ...(authOptions as NextAuthOptions),

  // Force JWT sessions unless explicitly overridden by provided options
  session: {
    strategy: "jwt",
    ...(authOptions as any)?.session,
  },

  callbacks: {
    ...(authOptions as any)?.callbacks,

    /**
     * Run any existing session callback (if provided) first, then add userId from token.sub
     */
    async session({ session, token, user }) {
      const base =
        typeof (authOptions as any)?.callbacks?.session === "function"
          ? await (authOptions as any).callbacks.session({ session, token, user })
          : session;

      if (token && base) {
        (base as any).userId = token.sub;
      }
      return base;
    },
  },
};

// Export NextAuth helpers — DO NOT redeclare an `auth()` function yourself.
export const { auth, signIn, signOut, handlers } = NextAuth(mergedOptions);

// Handy helper for server components / actions
export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
