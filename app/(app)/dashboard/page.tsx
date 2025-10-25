import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

// Safely read string fields without requiring them to exist on the TS type
function getStringField(obj: unknown, keys: string[]): string | undefined {
  const anyObj = obj as Record<string, unknown> | null | undefined;
  if (!anyObj) return undefined;
  for (const k of keys) {
    const v = anyObj[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

// Safely read array-ish fields (e.g., businessDays could be string[] or JSON)
function getArrayLength(obj: unknown, keys: string[]): number {
  const anyObj = obj as Record<string, unknown> | null | undefined;
  if (!anyObj) return 0;
  for (const k of keys) {
    const v = anyObj[k];
    if (Array.isArray(v)) return v.length;
    // Sometimes stored as JSON string
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed.length;
      } catch {
        /* ignore */
      }
    }
  }
  return 0;
}

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

  // Load tenant + services (kept as-is)
  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    include: { services: true },
  });

  // Resolve potentially differently-named fields without breaking types
  const phone = getStringField(tenant, ["phone"]);
  const website = getStringField(tenant, ["websiteUrl", "website", "siteUrl", "url"]);
  const licenseNumber = getStringField(tenant, ["licenseNumber", "license"]);
  const openTime = getStringField(tenant, ["openTime", "openingTime", "hoursOpen"]);
  const closeTime = getStringField(tenant, ["closeTime", "closingTime", "hoursClose"]);
  const businessDaysLen = getArrayLength(tenant, ["businessDays", "workDays", "openDays"]);

  const startAnimationHeadline =
    getStringField(tenant, ["startAnimationHeadline", "startHeadline", "welcomeHeadline"]);
  const startAnimationSubtext =
    getStringField(tenant, ["startAnimationSubtext", "startSubtext", "welcomeSubtext"]);

  const isSetupIncomplete =
    !phone ||
    !website ||
    !licenseNumber ||
    businessDaysLen === 0 ||
    !openTime ||
    !closeTime ||
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
              Generated from your theme &amp; details. This is what the assistant uses on open.
            </p>
            <div className="rounded-lg bg-black/30 p-4 text-sm leading-relaxed">
              <div className="text-xl font-bold mb-1">
                {startAnimationHeadline ?? `Welcome to ${tenant?.name ?? "Our Front Desk"}`}
              </div>
              <div className="opacity-80">
                {startAnimationSubtext ?? "How can we help you today?"}
              </div>
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
                    <div className="text-sm mt-2 opacity-80">
                      ${Number(s.price as unknown as number).toFixed(2)}
                    </div>
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
