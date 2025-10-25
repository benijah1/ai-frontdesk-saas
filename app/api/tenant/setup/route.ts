// app/api/tenant/setup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";

export const runtime = "nodejs";

// --- utils ---
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
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Theme / identity
    const name: string | undefined = typeof body.name === "string" ? body.name.trim() : undefined;
    const subdomainRaw: string | undefined =
      typeof body.subdomain === "string" ? body.subdomain.trim() : undefined;
    const pathSlugRaw: string | undefined =
      typeof body.pathSlug === "string" ? body.pathSlug.trim() : undefined;
    const primaryColor: string | undefined =
      typeof body.primaryColor === "string" ? body.primaryColor.trim() : undefined;
    const accentColor: string | undefined =
      typeof body.accentColor === "string" ? body.accentColor.trim() : undefined;
    const logoUrl: string | undefined =
      typeof body.logoUrl === "string" ? body.logoUrl.trim() : undefined;

    // Business details
    const phone: string | undefined = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const websiteUrl: string | undefined =
      typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : undefined;
    const licenseNumber: string | undefined =
      typeof body.licenseNumber === "string" ? body.licenseNumber.trim() : undefined;

    const businessDays: string[] = Array.isArray(body.businessDays)
      ? body.businessDays.filter((d: any) => typeof d === "string" && d.trim()).map((d: string) => d.trim())
      : [];

    const openTime: string | null =
      typeof body.openTime === "string" && body.openTime.trim() ? body.openTime.trim() : null;
    const closeTime: string | null =
      typeof body.closeTime === "string" && body.closeTime.trim() ? body.closeTime.trim() : null;

    const awards: string[] = Array.isArray(body.awards)
      ? body.awards.filter((a: any) => typeof a === "string" && a.trim()).map((a: string) => a.trim())
      : [];

    // Services
    const services: Array<{ name: string; description?: string; price?: number | null }> = Array.isArray(
      body.services
    )
      ? body.services
          .filter((s: any) => s && typeof s.name === "string" && s.name.trim())
          .map((s: any) => ({
            name: s.name.trim(),
            description: typeof s.description === "string" ? s.description.trim() : undefined,
            price:
              typeof s.price === "number"
                ? s.price
                : s.price === "" || s.price == null
                ? null
                : Number.isFinite(Number(s.price))
                ? Number(s.price)
                : null,
          }))
      : [];

    // Start animation content
    const startAnimationHeadlineRaw: string | undefined =
      typeof body.startAnimationHeadline === "string" ? body.startAnimationHeadline.trim() : undefined;
    const startAnimationSubtextRaw: string | undefined =
      typeof body.startAnimationSubtext === "string" ? body.startAnimationSubtext.trim() : undefined;

    // Load or create tenant for this user
    let tenant = await prisma.tenant.findFirst({
      where: { users: { some: { id: userId } } },
      include: { services: true },
    });

    // Derive path/subdomain
    const desiredPathSlug = slugify(pathSlugRaw || tenant?.pathSlug || name || `t-${randomSuffix(8)}`) || `t-${randomSuffix(10)}`;
    const desiredSubdomain = subdomainRaw ? slugify(subdomainRaw) : tenant?.subdomain || undefined;

    // Create tenant if user has none yet
    if (!tenant) {
      if (!name) {
        return NextResponse.json(
          { error: "Missing required field: name (for initial tenant creation)" },
          { status: 400 }
        );
      }

      // Ensure pathSlug is unique; if conflict, suffix it
      let pathSlugUnique = desiredPathSlug;
      // (optional uniqueness check — safe to skip if DB already enforces uniqueness)
      const existing = await prisma.tenant.findUnique({ where: { pathSlug: pathSlugUnique } }).catch(() => null);
      if (existing) {
        pathSlugUnique = `${pathSlugUnique}-${randomSuffix(4)}`;
      }

      tenant = await prisma.tenant.create({
        data: {
          name,
          pathSlug: pathSlugUnique,
          ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
          ...(primaryColor ? { primaryColor } : {}),
          ...(accentColor ? { accentColor } : {}),
          ...(logoUrl ? { logoUrl } : {}),
          users: { connect: { id: userId } }, // attach this user
        },
        include: { services: true },
      });
    }

    // Compute final start animation content
    const startAnimationHeadline =
      startAnimationHeadlineRaw || (name || tenant.name ? `Welcome to ${name || tenant.name}` : "Welcome to our Front Desk");
    const startAnimationSubtext =
      startAnimationSubtextRaw || "Ask me about availability, pricing, or booking — I’m here to help.";

    // Update tenant fields
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...(name ? { name } : {}),
        ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
        ...(desiredPathSlug ? { pathSlug: desiredPathSlug } : {}),
        ...(primaryColor ? { primaryColor } : {}),
        ...(accentColor ? { accentColor } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(phone ? { phone } : {}),
        ...(websiteUrl ? { websiteUrl } : {}),
        ...(licenseNumber ? { licenseNumber } : {}),
        ...(businessDays.length ? { businessDays } : { businessDays: [] }),
        openTime,
        closeTime,
        ...(awards.length ? { awards } : { awards: [] }),
        startAnimationHeadline,
        startAnimationSubtext,
      },
      include: { services: true },
    });

    // ---- Service upsert by slug (keeps existing, updates changed, removes missing) ----
    // Make desired set keyed by slug
    const targetBySlug: Record<
      string,
      { name: string; description?: string; price?: number | null }
    > = {};

    for (const s of services) {
      const base = `${updatedTenant.pathSlug}-${s.name}`;
      let slug = slugify(base) || `svc-${randomSuffix(8)}`;
      // If slug collides in this payload, append suffix
      while (targetBySlug[slug]) slug = `${slug}-${randomSuffix(3)}`;
      targetBySlug[slug] = { name: s.name, description: s.description, price: s.price ?? null };
    }

    // Delete services not present anymore
    const keepSlugs = Object.keys(targetBySlug);
    await prisma.service.deleteMany({
      where: {
        tenantId: updatedTenant.id,
        ...(keepSlugs.length ? { NOT: { slug: { in: keepSlugs } } } : {}),
      },
    });

    // Upsert each desired service
    for (const [slug, s] of Object.entries(targetBySlug)) {
      await prisma.service.upsert({
        where: { slug }, // assumes slug is globally unique
        update: {
          name: s.name,
          description: s.description ?? null,
          price: s.price == null ? null : s.price,
        },
        create: {
          tenantId: updatedTenant.id,
          slug,
          name: s.name,
          description: s.description ?? null,
          price: s.price == null ? null : s.price,
        },
      });
    }

    // Return the fresh tenant w/ services
    const finalTenant = await prisma.tenant.findUnique({
      where: { id: updatedTenant.id },
      include: { services: true },
    });

    return NextResponse.json({ ok: true, tenant: finalTenant });
  } catch (err: any) {
    console.error("Tenant setup error:", err);
    return NextResponse.json(
      { error: "Failed to setup tenant", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
