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
    const secondaryColor: string | undefined =
      typeof body.secondaryColor === "string" ? body.secondaryColor.trim() : undefined;
    const accentColor: string | undefined =
      typeof body.accentColor === "string" ? body.accentColor.trim() : undefined;
    const brandFont: string | undefined =
      typeof body.brandFont === "string" ? body.brandFont.trim() : undefined;
    const logoUrl: string | undefined =
      typeof body.logoUrl === "string" ? body.logoUrl.trim() : undefined;

    // Business details
    const phone: string | undefined = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const email: string | undefined = typeof body.email === "string" ? body.email.trim() : undefined;
    const address: string | undefined = typeof body.address === "string" ? body.address.trim() : undefined;
    const city: string | undefined = typeof body.city === "string" ? body.city.trim() : undefined;
    const state: string | undefined = typeof body.state === "string" ? body.state.trim() : undefined;
    const zip: string | undefined = typeof body.zip === "string" ? body.zip.trim() : undefined;

    // NOT IN SCHEMA (remove): websiteUrl
    // const websiteUrl: string | undefined =
    //   typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : undefined;

    // Hours & schedule
    const businessDays: string[] = Array.isArray(body.businessDays)
      ? body.businessDays
          .filter((d: unknown) => typeof d === "string" && d.trim())
          .map((d: string) => d.trim())
      : [];

    const openTime: string | null =
      typeof body.openTime === "string" && body.openTime.trim() ? body.openTime.trim() : null;
    const closeTime: string | null =
      typeof body.closeTime === "string" && body.closeTime.trim() ? body.closeTime.trim() : null;

    const hoursJson: string | undefined =
      typeof body.hoursJson === "string" ? body.hoursJson.trim() : undefined;

    const awards: string[] = Array.isArray(body.awards)
      ? body.awards
          .filter((a: unknown) => typeof a === "string" && a.trim())
          .map((a: string) => a.trim())
      : [];

    // Services (relation table)
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

    // Copy
    const startAnimationHeadline: string | undefined =
      typeof body.startAnimationHeadline === "string" && body.startAnimationHeadline.trim()
        ? body.startAnimationHeadline.trim()
        : undefined;
    const startAnimationSubtext: string | undefined =
      typeof body.startAnimationSubtext === "string" && body.startAnimationSubtext.trim()
        ? body.startAnimationSubtext.trim()
        : undefined;

    const greeting: string | undefined =
      typeof body.greeting === "string" ? body.greeting.trim() : undefined;
    const voice: string | undefined = typeof body.voice === "string" ? body.voice.trim() : undefined;

    // Load or create tenant for this user
    let tenant = await prisma.tenant.findFirst({
      where: { users: { some: { id: userId } } },
      include: { services: true },
    });

    // Derive path/subdomain
    const desiredPathSlug =
      slugify(pathSlugRaw || tenant?.pathSlug || name || `t-${randomSuffix(8)}`) ||
      `t-${randomSuffix(10)}`;
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
      const existing = await prisma.tenant.findUnique({ where: { pathSlug: pathSlugUnique } }).catch(() => null);
      if (existing) pathSlugUnique = `${pathSlugUnique}-${randomSuffix(4)}`;

      tenant = await prisma.tenant.create({
        data: {
          name,
          pathSlug: pathSlugUnique,
          ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
          ...(primaryColor ? { primaryColor } : {}),
          ...(secondaryColor ? { secondaryColor } : {}),
          ...(accentColor ? { accentColor } : {}),
          ...(brandFont ? { brandFont } : {}),
          ...(logoUrl ? { logoUrl } : {}),
          users: { connect: { id: userId } },
        },
        include: { services: true },
      });
    }

    // Fallback copy for UI echo (but we also persist if provided)
    const echoHeadline =
      startAnimationHeadline || (name || tenant.name ? `Welcome to ${name || tenant.name}` : "Welcome to our Front Desk");
    const echoSubtext =
      startAnimationSubtext || "Ask me about availability, pricing, or booking — I’m here to help.";

    // Build Prisma-safe update payload (matches your schema)
    const data: Prisma.TenantUpdateInput = {
      ...(name ? { name } : {}),
      ...(desiredSubdomain ? { subdomain: desiredSubdomain } : {}),
      ...(desiredPathSlug ? { pathSlug: desiredPathSlug } : {}),

      // Branding
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(accentColor ? { accentColor } : {}),
      ...(brandFont ? { brandFont } : {}),
      ...(logoUrl ? { logoUrl } : {}),

      // Contact / location
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
      ...(city ? { city } : {}),
      ...(state ? { state } : {}),
      ...(zip ? { zip } : {}),

      // Hours & schedule
      ...(Array.isArray(businessDays) ? { businessDays } : {}),
      openTime,
      closeTime,
      ...(typeof hoursJson === "string" ? { hoursJson } : {}),

      // Copy / AI
      ...(typeof greeting === "string" ? { greeting } : {}),
      ...(typeof voice === "string" ? { voice } : {}),
      ...(typeof startAnimationHeadline === "string" ? { startAnimationHeadline } : {}),
      ...(typeof startAnimationSubtext === "string" ? { startAnimationSubtext } : {}),

      // Badges
      ...(Array.isArray(awards) ? { awards } : {}),
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data,
      include: { services: true },
    });

    // ---- Service upsert by (tenantId, slug) unique ----
    // Build desired set keyed by slug (unique per tenant)
    const targetBySlug: Record<string, { name: string; description?: string; price?: number | null }> = {};
    for (const s of services) {
      // Slug unique per tenant—use service name as base
      let slug = slugify(s.name) || `svc-${randomSuffix(8)}`;
      // De-dupe within this request
      while (targetBySlug[slug]) slug = `${slug}-${randomSuffix(3)}`;
      targetBySlug[slug] = { name: s.name, description: s.description, price: s.price ?? null };
    }

    // Remove services not present in the submitted list
    const keepSlugs = Object.keys(targetBySlug);
    await prisma.service.deleteMany({
      where: {
        tenantId: updatedTenant.id,
        ...(keepSlugs.length ? { NOT: { slug: { in: keepSlugs } } } : {}),
      },
    });

    // Upsert each target (uses composite unique: @@unique([tenantId, slug]))
    for (const [slug, s] of Object.entries(targetBySlug)) {
      await prisma.service.upsert({
        where: { tenantId_slug: { tenantId: updatedTenant.id, slug } },
        update: {
          name: s.name,
          description: s.description ?? null,
          price: s.price == null ? null : s.price,
          active: true,
        },
        create: {
          tenantId: updatedTenant.id,
          slug,
          name: s.name,
          description: s.description ?? null,
          price: s.price == null ? null : s.price,
          active: true,
        },
      });
    }

    const finalTenant = await prisma.tenant.findUnique({
      where: { id: updatedTenant.id },
      include: { services: true },
    });

    return NextResponse.json({
      ok: true,
      tenant: finalTenant,
      // Echo for UI preview
      startAnimationHeadline: echoHeadline,
      startAnimationSubtext: echoSubtext,
    });
  } catch (err: any) {
    console.error("Tenant setup error:", err);
    return NextResponse.json(
      { error: "Failed to setup tenant", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
