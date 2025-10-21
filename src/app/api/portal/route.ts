import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  })
  if (!membership?.organization) return NextResponse.json({ error: "No org" }, { status: 400 })
  const orgId = membership.organization.id

  const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } })
  if (!sub?.stripeCustomerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 })

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: (process.env.APP_BASE_URL || process.env.NEXTAUTH_URL)!,
  })

  return NextResponse.json({ url: portal.url })
}
