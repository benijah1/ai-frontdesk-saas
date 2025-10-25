// app/(app)/setup/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import FrontDeskSetupForm from "@/components/FrontDeskSetupForm";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

// Parse businessDays if it might be a JSON string in the DB
function normalizeBusinessDays(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {}
  }
  return undefined;
}

// Coerce the Prisma tenant payload into the shape FrontDeskSetupForm expects
function toSetupInitialData(tenant: any) {
  if (!tenant) return undefined;

  // Map Prisma services -> ServiceRow[]
  const services = Array.isArray(tenant.services)
    ? tenant.services.map((s: any) => ({
        name: String(s?.name ?? "").trim(),
        description: s?.description ?? undefined, // null -> undefined
        price:
          s?.price === null || s?.price === undefined
            ? ""
            : Number(s.price), // Decimal -> number
      }))
    : [];

  return {
    name: tenant.name ?? undefined,
    phone: tenant.phone ?? undefined,
    websiteUrl:
      tenant.websiteUrl ?? tenant.website ?? tenant.siteUrl ?? tenant.url ?? undefined,
    licenseNumber: tenant.licenseNumber ?? tenant.license ?? undefined,
    businessDays: normalizeBusinessDays(tenant.businessDays),
    openTime: tenant.openTime ?? tenant.openingTime ?? undefined,
    closeTime: tenant.closeTime ?? tenant.closingTime ?? undefined,
    primaryColor: tenant.primaryColor ?? undefined,
    accentColor: tenant.accentColor ?? undefined,
    logoUrl: tenant.logoUrl ?? undefined,
    services, // <-- ServiceRow[]
    // If you store subdomain/pathSlug, include here as well:
    subdomain: tenant.subdomain ?? undefined,
    pathSlug: tenant.pathSlug ?? undefined,
  };
}

export default async function SetupPage() {
  noStore();
  const session = await auth();

  // Enforce auth on the server to avoid signed-out flashes
  if (!session?.user) redirect("/login");

  // Resolve userId robustly (session.user.id is not guaranteed unless you add it in callbacks)
  let userId: string | undefined =
    (session.user as any)?.id ||
    (session as any)?.userId ||
    (session.user as any)?.userId;

  if (!userId && session.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = dbUser?.id;
  }

  if (!userId) redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    include: { services: true },
  });

  const initialData = toSetupInitialData(tenant);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">AI Front Desk Setup</h1>
      <FrontDeskSetupForm initialData={initialData} />
    </main>
  );
}
