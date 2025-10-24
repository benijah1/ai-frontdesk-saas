// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "benjamin@reachsmart.ai";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bobcats001"; // dev fallback
  const tenantName = process.env.ADMIN_TENANT ?? "ReachSmart";

  if (!adminPassword) {
    throw new Error("No admin password provided. Set ADMIN_PASSWORD in env.");
  }

  const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  let tenant = await prisma.tenant.findFirst({ where: { name: tenantName } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: tenantName, primaryColor: "#0ea5e9" },
    });
    console.log("✅ Created tenant:", tenant.name);
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log("⚙️  Admin already exists — updating privileges...");
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashed,
        role: "SUPERADMIN",      // string (SQLite-safe)
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
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
