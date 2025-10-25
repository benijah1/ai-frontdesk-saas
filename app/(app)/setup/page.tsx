// app/(app)/setup/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import FrontDeskSetupForm from "./frontdesksetupform";

// Coerce the Prisma tenant payload into the shape FrontDeskSetupForm expects
function toSetupInitialData(tenant: any) {
  if (!tenant) return undefined;

  // Map Prisma services -> ServiceRow[]
  const services = Array.isArray(tenant.services)
    ? tenant.services.map((s: any) => ({
        name: String(s?.name ?? "").trim(),
        description: s?.description ?? undefined, // null -> undefined
        // Decimal | null -> number | ""
        price:
          s?.price === null || s?.price === undefined
            ? ""
            : Number(s.price),
      }))
    : [];

  // Normalize common scalar fields; keep it permissive so TS is happy
  return {
    name: tenant.name ?? undefined,
    phone: tenant.phone ?? undefined,
    websiteUrl: tenant.websiteUrl ?? tenant.website ?? tenant.siteUrl ?? tenant.url ?? undefined,
    licenseNumber: tenant.licenseNumber ?? tenant.license ?? undefined,
    businessDays: Array.isArray(tenant.businessDays) ? tenant.businessDays : undefined,
    openTime: tenant.openTime ?? tenant.openingTime ?? undefined,
    closeTime: tenant.closeTime ?? tenant.closingTime ?? undefined,
    primaryColor: tenant.primaryColor ?? undefined,
    accentColor: tenant.accentColor ?? undefined,
    logoUrl: tenant.logoUrl ?? undefined,
    services, // <-- ServiceRow[]
  };
}

export default async function SetupPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Setup</h1>
        <p className="text-muted-foreground">
          Please <Link href="/login" className="underline">sign in</Link> to continue.
        </p>
      </main>
    );
  }

  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    include: { services: true },
  });

  const initialData = toSetupInitialData(tenant);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">AI Front Desk Setup</h1>
      {/* initialData is now typed correctly for the form */}
      <FrontDeskSetupForm initialData={initialData} />
    </main>
  );
}
