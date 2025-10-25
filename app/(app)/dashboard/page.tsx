import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
        <p className="text-muted-foreground">
          Please <Link href="/login" className="underline">sign in</Link> to view your dashboard.
        </p>
      </main>
    );
  }

  // Load tenant + minimal info needed to decide if setup is complete
  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    include: { services: true },
  });

  const isSetupIncomplete =
    !tenant?.phone ||
    !tenant?.websiteUrl ||
    !tenant?.licenseNumber ||
    !(tenant?.businessDays?.length) ||
    !tenant?.openTime ||
    !tenant?.closeTime ||
    !(tenant?.services?.length);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/setup"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-white/5"
        >
          Setup / Edit Front Desk
        </Link>
      </div>

      {isSetupIncomplete ? (
        <div className="rounded-xl border p-6 bg-white/5">
          <h2 className="text-lg font-semibold mb-2">Finish your setup</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We need a few details (services, hours, license, phone, website, etc.) to personalize your AI Front Desk.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Go to Setup
          </Link>
        </div>
      ) : (
        <>
          {/* Example: Start animation preview content */}
          <section className="rounded-xl border p-6 mb-6 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">AI Front Desk — Start Animation Content</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Generated from your theme & details. This is what the assistant uses on open.
            </p>
            <div className="rounded-lg bg-black/30 p-4 text-sm leading-relaxed">
              <div className="text-xl font-bold mb-1">{tenant?.startAnimationHeadline ?? `Welcome to ${tenant?.name ?? "Our Front Desk"}`}</div>
              <div className="opacity-80">{tenant?.startAnimationSubtext ?? "How can we help you today?"}</div>
            </div>
          </section>

          {/* Example: Service cards preview */}
          <section className="rounded-xl border p-6 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Service Cards (Generated)</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(tenant?.services ?? []).map((s) => (
                <div key={s.id} className="rounded-lg border p-4 bg-black/30">
                  <div className="font-medium">{s.name}</div>
                  {s.description ? (
                    <p className="text-sm opacity-80 mt-1 line-clamp-3">{s.description}</p>
                  ) : null}
                  {"price" in s && s.price != null ? (
                    <div className="text-sm mt-2 opacity-80">${Number(s.price).toFixed(2)}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
