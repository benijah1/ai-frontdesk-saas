import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return <div className="p-6">Please sign in</div>

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: { include: { subscription: true } } },
  })
  const org = membership?.organization
  if (!org) return <div className="p-6">No organization found</div>

  const isActive = true // paywall disabled for testing

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-gray-600 mt-2">Organization: <strong>{org.name}</strong> — <span className="text-xs">/u/{org.slug}</span></p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border p-4">
          <h2 className="font-medium">Subscription</h2>
          <p className="text-sm mt-1">Status: <strong>{org.subscription?.status ?? "inactive"}</strong></p>
          <div className="mt-3 flex gap-3">
            {false ? (
              <form action="/api/stripe/create-checkout" method="POST">
                <button className="rounded bg-black text-white px-4 py-2">Subscribe $25/mo</button>
              </form>
            ) : (
              <a href="/api/portal" className="rounded px-4 py-2 border">Manage Billing</a>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="font-medium">Your AI Front Desk</h2>
          <p className="text-sm mt-1">
            Customize your tenant theme and generate a branded AI Front Desk endpoint.
          </p>
          <div className="mt-3 flex gap-3">
            <Link href={`/u/${org.slug}`} className="rounded px-4 py-2 border">Open Public Page</Link>
            <form action={`/api/tenants/${org.slug}/frontdesk`} method="POST">
              <button className="rounded bg-black text-white px-4 py-2">Generate / Update</button>
            </form>
          </div>
        </div>
      </div>
    
  <div className="mt-6 rounded-xl border p-4">
    <h2 className="font-medium">CRM</h2>
    <p className="text-sm mt-1">Capture and manage leads right from your Front Desk.</p>
    <div className="mt-3">
      <a href="/dashboard/crm" className="rounded px-4 py-2 border">Open CRM</a>
    </div>
  </div>
</main>
  )
}
