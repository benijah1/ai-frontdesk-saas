// auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import { authOptions } from "./app/api/auth/auth-options";

// Merge our local tweaks with whatever is already in authOptions
const mergedOptions: NextAuthOptions = {
  ...authOptions,
  trustHost: true,
  session: {
    strategy: "jwt",
    ...(authOptions as any).session,
  },
  callbacks: {
    ...(authOptions as any).callbacks,
    async session({ session, token, user }) {
      // Run any existing session callback first (if provided)
      const base =
        (authOptions as any).callbacks?.session
          ? await (authOptions as any).callbacks.session({ session, token, user })
          : session;

      if (token) (base as any).userId = token.sub;
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

// If you need route handlers elsewhere, you can re-export:
// export const { GET, POST } = handlers;
