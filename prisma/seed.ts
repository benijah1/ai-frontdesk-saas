// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Configuration: prefer env vars for security, fallback to default
  const adminEmail = process.env.ADMIN_EMAIL ?? "benjamin@reachsmart.ai";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bobcats001"; // fallback for dev only
  const tenantName = process.env.ADMIN_TENANT ?? "ReachSmart";

  if (!adminPassword) {
    throw new Error("No admin password provided. Set ADMIN_PASSWORD in your environment.");
  }

  // Hash password securely
  const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  // Ensure tenant exists
  let tenant = await prisma.tenant.findFirst({ where: { name: tenantName } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        primaryColor: "#0ea5e9",
      },
    });
    console.log("✅ Created tenant:", tenant.name);
  }

  // Find or create admin user
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log("⚙️  Admin already exists — updating privileges...");
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashed,
        role: "SUPERADMIN", // now a string instead of enum
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
        role: "SUPERADMIN", // string, safe for SQLite
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
