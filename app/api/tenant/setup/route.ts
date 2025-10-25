// app/api/tenant/setup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Minimal slugify for path slugs
function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function randomSuffix(len = 8) {
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

    // If the slug ended up empty (e.g., name was only symbols), add a random suffix.
    if (!desiredPathSlug) desiredPathSlug = `t-${randomSuffix(10)}`;

    // Choose a valid unique selector for upsert:
    // Try subdomain first (if provided), else pathSlug.
    const where =
      desiredSubdomain
        ? ({ subdomain: desiredSubdomain } as const)
        : ({ pathSlug: desiredPathSlug } as const);

    // Shape the data for update/create. Adjust fields to match your Tenant model.
    const tenantData = {
      name,
      // Only set subdomain if provided or if you want to mirror pathSlug as default:
      ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
      pathSlug: desiredPathSlug,
      ...(primaryColor ? { primaryColor } : {}),
      // Example branding fields if they exist in your schema:
      ...(("logoUrl" in branding && branding.logoUrl) ? { logoUrl: branding.logoUrl } : {}),
      ...(("accentColor" in branding && branding.accentColor) ? { accentColor: branding.accentColor } : {}),
    };

    // Optional: prepare nested services upserts/creates if your schema supports it.
    // If your schema has a Service model with unique name per tenant, you might want to
    // do separate upserts. Here we’ll just create on tenant creation and skip on update.
    const createData = {
      ...tenantData,
      ...(Array.isArray(services) && services.length > 0
        ? {
            services: {
              create: services
                .filter((s: any) => s && typeof s.name === "string" && s.name.trim())
                .map((s: any) => ({
                  name: s.name.trim(),
                  // Include any other fields your Service model supports:
                  ...(s.description ? { description: String(s.description) } : {}),
                  ...(typeof s.price === "number" ? { price: s.price } : {}),
                })),
            },
          }
        : {}),
    };

    const tenant = await prisma.tenant.upsert({
      where,
      update: tenantData, // keep this conservative; avoid mass-creating services on update
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
