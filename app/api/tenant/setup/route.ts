// app/api/tenant/setup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Minimal slugify for path slugs
function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function randomSuffix(len = 6) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expecting at least a name; optionally subdomain, pathSlug, primaryColor, services, branding, etc.
    const {
      name,
      subdomain: subdomainRaw,
      pathSlug: pathSlugRaw,
      primaryColor,
      services = [],
      branding = {},
    } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    // Prefer caller-provided unique keys; otherwise derive a stable unique pathSlug from name.
    const desiredSubdomain =
      typeof subdomainRaw === "string" && subdomainRaw.trim()
        ? slugify(subdomainRaw)
        : undefined;

    let desiredPathSlug =
      typeof pathSlugRaw === "string" && pathSlugRaw.trim()
        ? slugify(pathSlugRaw)
        : slugify(name);

    if (!desiredPathSlug) desiredPathSlug = `t-${randomSuffix(10)}`;

    // Choose a valid unique selector for upsert:
    const where =
      desiredSubdomain
        ? ({ subdomain: desiredSubdomain } as const)
        : ({ pathSlug: desiredPathSlug } as const);

    // Shape the data for update/create. Adjust fields to match your Tenant model.
    const tenantData: Prisma.TenantUpdateInput & Prisma.TenantCreateInput = {
      name,
      ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
      pathSlug: desiredPathSlug,
      ...(primaryColor ? { primaryColor } : {}),
      ...(("logoUrl" in branding && branding.logoUrl) ? { logoUrl: branding.logoUrl } : {}),
      ...(("accentColor" in branding && branding.accentColor) ? { accentColor: branding.accentColor } : {}),
    };

    // ---- Services (create only on initial tenant creation) ----
    // Your Service model requires `slug`, so provide it here.
    let serviceCreates: Prisma.ServiceCreateWithoutTenantInput[] | undefined = undefined;

    if (Array.isArray(services) && services.length > 0) {
      serviceCreates = services
        .filter((s: any) => s && typeof s.name === "string" && s.name.trim())
        .map((s: any) => {
          const svcName = String(s.name).trim();
          // Make the service slug scoped by tenant pathSlug to avoid global collisions, if slug is globally unique.
          const base = `${desiredPathSlug}-${svcName}`;
          const svcSlug = slugify(base) || `svc-${randomSuffix(8)}`;

          const payload: Prisma.ServiceCreateWithoutTenantInput = {
            name: svcName,
            slug: svcSlug,
            ...(s.description ? { description: String(s.description) } : {}),
            ...(typeof s.price === "number" ? { price: s.price } : {}),
          };

          return payload;
        });

      if (serviceCreates.length === 0) {
        serviceCreates = undefined;
      }
    }

    const createData: Prisma.TenantCreateInput = {
      name: tenantData.name!,
      pathSlug: tenantData.pathSlug!,
      ...(tenantData.subdomain ? { subdomain: tenantData.subdomain as string } : {}),
      ...(tenantData.primaryColor ? { primaryColor: tenantData.primaryColor as string } : {}),
      ...(tenantData as any).logoUrl ? { logoUrl: (tenantData as any).logoUrl } : {},
      ...(tenantData as any).accentColor ? { accentColor: (tenantData as any).accentColor } : {},
      ...(serviceCreates
        ? {
            services: {
              create: serviceCreates,
            },
          }
        : {}),
    };

    const tenant = await prisma.tenant.upsert({
      where,
      update: tenantData,
      create: createData,
      include: { services: true },
    });

    return NextResponse.json({ ok: true, tenant });
  } catch (err: any) {
    console.error("Tenant setup error:", err);
    return NextResponse.json(
      { error: "Failed to setup tenant", detail: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
