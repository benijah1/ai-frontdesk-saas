// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Generate a lowercase, URL-safe slug (24 chars, no dashes). */
function generateSlug(length = 24): string {
  // base36 random chunks concatenated until length reached
  let out = "";
  while (out.length < length) {
    out += Math.random().toString(36).slice(2); // [a-z0-9]+
  }
  return out.slice(0, length);
}

/** Ensure tenant has a unique pathSlug; returns the slug if created/unchanged. */
async function ensureTenantSlug(tenantId: string, existing?: string | null): Promise<string> {
  if (existing) return existing;

  // Try a few times to avoid rare collisions on the unique index
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    try {
      const updated = await prisma.tenant.update({
        where: { id: tenantId },
        data: { pathSlug: slug },
        select: { pathSlug: true },
      });
      return updated.pathSlug!;
    } catch (err: any) {
      // If unique constraint fails, retry. Otherwise, rethrow.
      const msg = String(err?.message || "");
      if (!msg.includes("Unique constraint") && !msg.includes("Unique constraint failed")) {
        throw err;
      }
      // collision -> try again
    }
  }
  throw new Error("Failed to assign a unique pathSlug after multiple attempts.");
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "benjamin@reachsmart.ai";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bobcats001"; // dev fallback
  const tenantName = process.env.ADMIN_TENANT ?? "ReachSmart";

  if (!adminPassword) {
    throw new Error("No admin password provided. Set ADMIN_PASSWORD in env.");
  }

  const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  // -- Upsert Tenant by name --
  let tenant = await prisma.tenant.findFirst({
    where: { name: tenantName },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        primaryColor: "#0ea5e9",
        secondaryColor: "#111827",
        accentColor: "#22d3ee",
        brandFont: "Inter",
        // pathSlug is optional in schema during rollout; set immediately here
        pathSlug: generateSlug(),
      },
    });
    console.log("✅ Created tenant:", tenant.name);
  } else {
    // Backfill pathSlug if null
    const slug = await ensureTenantSlug(tenant.id, tenant.pathSlug ?? undefined);
    if (!tenant.pathSlug) {
      console.log(`🔧 Backfilled pathSlug for tenant "${tenant.name}": ${slug}`);
    }
    // Refresh tenant snapshot
    tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenant.id } });
  }

  // -- Upsert Admin User --
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log("⚙️  Admin already exists — updating privileges & password...");
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashed,
        role: "SUPERADMIN", // string role
        isAdmin: true,
        bypassPaywall: true,
        tenantId: tenant.id,
      },
    });
    console.log("✅ Updated admin user:", adminEmail);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: "Benjamin Ijah",
        role: "SUPERADMIN",
        isAdmin: true,
        bypassPaywall: true,
        tenant: { connect: { id: tenant.id } },
      },
    });
    console.log("✅ Created new admin user:", adminEmail);
  }

  // Optional: sanity log
  console.log("🏁 Seed complete. Tenant:", tenant.name, "| pathSlug:", tenant.pathSlug);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
