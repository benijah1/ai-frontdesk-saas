// auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import { authOptions } from "./app/api/auth/auth-options";

// --- Merge our local tweaks with whatever is already in authOptions ---
const config: NextAuthConfig = {
  ...authOptions,
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

// --- Export NextAuth helpers (v5 pattern) ---
export const { auth, signIn, signOut, handlers } = NextAuth(config);

// --- Server-side helper for getting current user ---
export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// If you need route handlers elsewhere:
// export const { GET, POST } = handlers;
