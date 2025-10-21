# AI FrontDesk SaaS Starter (Next.js 14 + NextAuth + Prisma)

This starter adds a real **Home page**, **Sign Up**, **Sign In**, and a **protected Dashboard**.
Stripe is stubbed; paywall is disabled by default for testing.

## Quickstart

```bash
pnpm i
pnpm dlx prisma migrate dev --name init
pnpm dev
```

Create `.env` from `.env.example` and set `NEXTAUTH_SECRET` to a long random string.

## Deploy on Vercel
- Root directory: the repository root (where `package.json` is).
- Build command: `pnpm run build`
- Install command: `pnpm install`
- Output: `.next`
- Add env vars from `.env` (without quotes).
