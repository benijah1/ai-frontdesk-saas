// app/api/tenant/setup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Create or update a Tenant from multipart/form-data or JSON.
 * Fields: name (required), subdomain, primaryColor, secondaryColor, accentColor, brandFont,
 *         logoUrl, phone, email, address, hoursJson, greeting, voice
 */
export async function POST(req: Request) {
  try {
    let body: Record<string, any> = {};

    // Support both form POST and JSON POST
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      form.forEach((v, k) => (body[k] = typeof v === "string" ? v : ""));
    } else if (contentType.includes("application/json")) {
      body = await req.json();
    }

    const name = String(body.name || "").trim();
    if (!name) {
      return new NextResponse("Company name required", { status: 400 });
    }

    const data = {
      name,
      subdomain: body.subdomain ? String(body.subdomain).trim() : null,
      primaryColor: body.primaryColor ? String(body.primaryColor) : null,
      secondaryColor: body.secondaryColor ? String(body.secondaryColor) : null,
      accentColor: body.accentColor ? String(body.accentColor) : null,
      brandFont: body.brandFont ? String(body.brandFont) : null,
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      phone: body.phone ? String(body.phone) : null,
      email: body.email ? String(body.email) : null,
      address: body.address ? String(body.address) : null,
      hoursJson: body.hoursJson ? String(body.hoursJson) : null,
      greeting: body.greeting ? String(body.greeting) : null,
      voice: body.voice ? String(body.voice) : null,
    } as const;

    // Upsert by name (adjust if you prefer unique by subdomain)
    const tenant = await prisma.tenant.upsert({
      where: { name },
      update: { ...data },
      create: { ...data },
      include: { services: true },
    });

    // Prefer subdomain link if present, otherwise /t/[pathSlug]
    const url =
      tenant.subdomain
        ? `https://${tenant.subdomain}.yourapp.com`
        : `/t/${tenant.pathSlug || ""}`;

    return NextResponse.json({ ok: true, tenantId: tenant.id, url });
  } catch (err: any) {
    console.error("Tenant setup error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
