# AI Front Desk SaaS Scaffold (Next.js 14 App Router)

This scaffold layers in multi-tenant SaaS features on top of your existing Next.js app:
- Auth.js (email/password + Google)
- Prisma + Postgres (Vercel Postgres ready)
- Stripe subscriptions ($25/mo) via Checkout + Customer Portal
- Tenant model with vanity slug (subpath `/u/[slug]`)
- Onboarding wizard (company name, license #, colors, slug)
- Per-tenant Front Desk configuration + generator action
- Simple theming per tenant

## Install
1) Copy/merge the contents of this scaffold into your repository.
2) Run:
   ```bash
   pnpm add next-auth @prisma/client prisma @auth/prisma-adapter zod stripe
   pnpm add -D prisma-client-js @types/node @types/jsonwebtoken @types/bcrypt
   ```
   If you use npm or yarn, switch commands accordingly.
3) Create a **Stripe Product** (`AI Front Desk`) and a **Price** for **$25/month**. Put the price id in `.env` -> `STRIPE_PRICE_MONTHLY`.
4) Add `.env` variables. See `.env.example` for required keys.
5) `pnpm prisma generate && pnpm prisma migrate dev -n init`
6) Start dev: `pnpm dev`

## Stripe Webhook
Create a webhook in Stripe for your deployed URL:
- Endpoint: `/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Notes
- This ships subpath tenants first (`/u/[slug]`). You can extend to subdomains later.
- The generator route is a placeholder that writes config state; wire it into your existing AI endpoints as needed.
