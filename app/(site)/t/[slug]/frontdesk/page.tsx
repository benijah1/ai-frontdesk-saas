// app/(site)/t/[slug]/frontdesk/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

function toTheme(t: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  brandFont?: string | null;
  logoUrl?: string | null;
}) {
  return {
    primary: t.primaryColor || "#0ea5e9",
    secondary: t.secondaryColor || "#111827",
    accent: t.accentColor || "#22d3ee",
    font: t.brandFont || "Inter",
    logo: t.logoUrl || "",
  };
}

export default async function FrontDeskPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug || "");

  // Accept either the vanity subdomain-like slug or the generated pathSlug
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ pathSlug: slug }, { subdomain: slug }],
    },
    include: {
      services: true,
    },
  });

  if (!tenant) return notFound();

  const theme = toTheme(tenant);

  return (
    <main
      style={{
        fontFamily: theme.font,
        background: theme.secondary,
        color: "white",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: theme.primary,
        }}
      >
        {theme.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={theme.logo} alt={`${tenant.name} logo`} height={32} />
        ) : null}
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{tenant.name}</h1>
      </header>

      <section style={{ padding: 20 }}>
        <p style={{ opacity: 0.9, marginBottom: 16 }}>
          {tenant.greeting || "Hi! How can I help?"}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {tenant.services.map((s) => (
            <div
              key={s.id}
              style={{
                background: "#0f172a",
                border: `1px solid ${theme.accent}`,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
              {s.description ? (
                <div style={{ fontSize: 13, opacity: 0.85 }}>{s.description}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
