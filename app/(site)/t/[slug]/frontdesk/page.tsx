// app/(site)/t/[slug]/frontdesk/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PrismaClient,
  type Service as PrismaService,
  type Tenant as PrismaTenant,
  Prisma,
} from "@prisma/client";

// ---- Prisma singleton (not exported) ----
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---- Types derived from Prisma ----
// Your Service currently looks like:
// { id, name, createdAt, tenantId, price: Decimal | null, description: string | null, slug: string, durationM: number | null, active: boolean }
type Service = PrismaService;
type Tenant = PrismaTenant & { services: Service[] };

// ---- Helpers ----
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtDuration = (mins?: number | null) => {
  if (!mins || mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

const decimalToNumber = (d: Prisma.Decimal | number | null) => {
  if (d === null || d === undefined) return null;
  // Prisma.Decimal is an object; Number() safely converts it
  return typeof d === "object" ? Number(d as Prisma.Decimal) : (d as number);
};

// ---- Data ----
async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!slug) return null;
  return (await prisma.tenant.findFirst({
    where: { OR: [{ pathSlug: slug }, { subdomain: slug }] },
    include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
  })) as Tenant | null;
}

// ---- Metadata ----
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) return { title: "Front Desk — Not Found" };
  const title = `${tenant.name} — Front Desk`;
  const description = "Explore services, pricing, and booking details powered by AI Front Desk.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

// ---- Page ----
export default async function FrontdeskPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  const services: Service[] = Array.isArray(tenant.services) ? (tenant.services as Service[]) : [];

  return (
    <main
      className="min-h-screen w-full"
      style={{
        background: tenant.primaryColor
          ? `radial-gradient(1200px 600px at 10% -10%, ${tenant.primaryColor}22, transparent 60%), radial-gradient(1000px 500px at 110% 10%, ${tenant.primaryColor}1A, transparent 60%), #0A0B10`
          : "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(1000px 500px at 110% 10%, rgba(14,165,233,0.12), transparent 60%), #0A0B10",
      }}
    >
      <section className="container mx-auto max-w-6xl px-6 py-10 text-white">
        <header className="mb-10">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm/6 text-white/80">AI Front Desk</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{tenant.name}</h1>
          {tenant.subdomain && (
            <p className="mt-1 text-white/60">
              subdomain: <span className="font-mono">{tenant.subdomain}</span>
            </p>
          )}
          {tenant.pathSlug && (
            <p className="text-white/60">
              path: <span className="font-mono">/t/{tenant.pathSlug}/frontdesk</span>
            </p>
          )}
          <p className="mt-4 max-w-3xl text-white/70">
            Browse services, pricing, and typical durations. When you’re ready, pick a service to start the
            conversation with our AI Front Desk.
          </p>
        </header>

        {/* Services */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No services are available yet.
            </div>
          )}

          {services.map((s: Service) => {
            const priceNum = decimalToNumber(s.price);
            const price = priceNum !== null && priceNum > 0 ? fmtUSD(priceNum) : null;
            const duration = fmtDuration(s.durationM ?? null);

            return (
              <article
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20"
              >
                {/* Thumb (placeholder since image field not in schema) */}
                <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-white/5">
                  <div className="flex h-full w-full items-center justify-center text-white/30">Service</div>
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 text-lg font-medium">{s.name}</h3>

                {/* Description */}
                {s.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-white/70">{s.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-white/50">No description provided.</p>
                )}

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
                  {price && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {price}
                    </span>
                  )}
                  {duration && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {duration}
                    </span>
                  )}
                  {s.slug && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs">
                      /{s.slug}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-5">
                  <a
                    href={
                      s.slug
                        ? `/t/${tenant.pathSlug ?? params.slug}/frontdesk/${encodeURIComponent(s.slug)}`
                        : `#`
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-disabled={!s.slug}
                    onClick={(e) => {
                      if (!s.slug) e.preventDefault();
                    }}
                  >
                    Start
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="opacity-80"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>

                {/* Subtle gradient hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(600px 200px at 0% 0%, rgba(255,255,255,0.06), transparent 70%)",
                  }}
                />
              </article>
            );
          })}
        </div>

        {/* Footer / Help */}
        <footer className="mt-14 text-sm text-white/50">
          Having trouble? Contact support and mention tenant ID{" "}
          <span className="font-mono text-white/60">{tenant.id}</span>.
        </footer>
      </section>
    </main>
  );
}
