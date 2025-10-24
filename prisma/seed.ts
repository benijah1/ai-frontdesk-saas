// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Config: pull password from env (recommended). Fallback to provided password only if env missing.
  const adminEmail = process.env.ADMIN_EMAIL ?? "benjamin@reachsmart.ai";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bobcats001"; // fallback - avoid committing this
  const tenantName = process.env.ADMIN_TENANT ?? "ReachSmart";

  if (!adminPassword) {
    throw new Error("No admin password provided. Set ADMIN_PASSWORD in env.");
  }

  // Basic password policy check (warn but continue)
  if (adminPassword.length < 8) {
    console.warn("Warning: provided password is shorter than 8 characters.");
  }

  // Hash password
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
    console.log("Created tenant:", tenant.id);
  }

  // Upsert user
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log("Admin user already exists. Updating role/isAdmin/bypassPaywall.");
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashed,
        role: "ADMIN",
        isAdmin: true,
        bypassPaywall: true,
        tenantId: tenant.id,
      },
    });
    console.log("Admin user updated:", adminEmail);
  } else {
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: "Benjamin Ijah",
        role: "ADMIN",
        isAdmin: true,
        bypassPaywall: true,
        tenant: { connect: { id: tenant.id } },
      },
    });
    console.log("Admin user created:", user.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
