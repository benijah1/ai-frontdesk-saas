"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceRow = { id?: string; name: string; description?: string; price?: number | "" };
type TenantLike = {
  id: string;
  name?: string | null;
  subdomain?: string | null;
  pathSlug?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  licenseNumber?: string | null;
  businessDays?: string[] | null;
  openTime?: string | null;
  closeTime?: string | null;
  awards?: string[] | null;
  startAnimationHeadline?: string | null;
  startAnimationSubtext?: string | null;
  services?: ServiceRow[];
};

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function FrontDeskSetupForm({ initialData }: { initialData?: Partial<TenantLike> }) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [subdomain, setSubdomain] = useState(initialData?.subdomain ?? "");
  const [pathSlug, setPathSlug] = useState(initialData?.pathSlug ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor ?? "#0ea5e9");
  const [accentColor, setAccentColor] = useState(initialData?.accentColor ?? "");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialData?.licenseNumber ?? "");
  const [businessDays, setBusinessDays] = useState<string[]>(initialData?.businessDays ?? ["Mon","Tue","Wed","Thu","Fri"]);
  const [openTime, setOpenTime] = useState(initialData?.openTime ?? "09:00");
  const [closeTime, setCloseTime] = useState(initialData?.closeTime ?? "17:00");
  const [awardsStr, setAwardsStr] = useState((initialData?.awards ?? []).join(", "));
  const [services, setServices] = useState<ServiceRow[]>(
    initialData?.services?.length ? initialData.services : [{ name: "", description: "", price: "" }]
  );

  // Start animation content (editable preview)
  const [startAnimationHeadline, setStartAnimationHeadline] = useState(
    initialData?.startAnimationHeadline ?? ""
  );
  const [startAnimationSubtext, setStartAnimationSubtext] = useState(
    initialData?.startAnimationSubtext ?? ""
  );

  // Derive defaults if empty
  const computedHeadline = useMemo(
    () => startAnimationHeadline || (name ? `Welcome to ${name}` : "Welcome to our Front Desk"),
    [startAnimationHeadline, name]
  );
  const computedSubtext = useMemo(
    () => startAnimationSubtext || "Ask me about availability, pricing, or booking — I’m here to help.",
    [startAnimationSubtext]
  );

  useEffect(() => {
    if (!subdomain && name) setSubdomain(slugify(name));
    if (!pathSlug && name) setPathSlug(slugify(name));
  }, [name]); // eslint-disable-line

  function updateService(idx: number, patch: Partial<ServiceRow>) {
    setServices((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }
  function addService() {
    setServices((prev) => [...prev, { name: "", description: "", price: "" }]);
  }
  function removeService(idx: number) {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleDay(day: string) {
    setBusinessDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const awards = awardsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      subdomain: subdomain || slugify(name),
      pathSlug: pathSlug || slugify(name),
      primaryColor,
      accentColor: accentColor || null,
      logoUrl: logoUrl || null,
      phone: phone || null,
      websiteUrl: websiteUrl || null,
      licenseNumber: licenseNumber || null,
      businessDays,
      openTime: openTime || null,
      closeTime: closeTime || null,
      awards,
      services: services
        .filter((s) => s.name?.trim())
        .map((s) => ({
          name: s.name.trim(),
          description: s.description?.trim() || null,
          price: s.price === "" ? null : Number(s.price),
        })),
      startAnimationHeadline: computedHeadline,
      startAnimationSubtext: computedSubtext,
    };

    const res = await fetch("/api/tenant/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data?.error || res.statusText}`);
      return;
    }
    // After save, suggest user jump to dashboard
    location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Company / Theme */}
      <section className="rounded-xl border p-6 bg-white/5">
        <h2 className="text-lg font-semibold mb-4">Company & Theme</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">Company Name</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Subdomain</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Path Slug</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={pathSlug} onChange={(e) => setPathSlug(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Primary Color</span>
            <input type="color" className="h-10 w-20 rounded bg-transparent" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Accent Color (optional)</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="#9333EA or empty" />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-sm mb-1">Logo URL</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </label>
        </div>
      </section>

      {/* Business Details */}
      <section className="rounded-xl border p-6 bg-white/5">
        <h2 className="text-lg font-semibold mb-4">Business Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">Phone</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Website (for AI training)</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://your-site.com" />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">License Number</span>
            <input className="w-full rounded-md bg-white/10 p-2" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="ABC-123456" />
          </label>

          <div className="sm:col-span-2">
            <span className="block text-sm mb-2">Business Days</span>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const active = businessDays.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1 rounded-full border text-sm ${active ? "bg-blue-600 text-white border-blue-500" : "bg-transparent"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

            <label className="block">
              <span className="block text-sm mb-1">Open Time</span>
              <input type="time" className="w-full rounded-md bg-white/10 p-2" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">Close Time</span>
              <input type="time" className="w-full rounded-md bg-white/10 p-2" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </label>

          <label className="block sm:col-span-2">
            <span className="block text-sm mb-1">Awards (comma-separated)</span>
            <input
              className="w-full rounded-md bg-white/10 p-2"
              value={awardsStr}
              onChange={(e) => setAwardsStr(e.target.value)}
              placeholder="Best of 2024, Top Service Provider, ..."
            />
          </label>
        </div>
      </section>

      {/* Services */}
      <section className="rounded-xl border p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Services</h2>
          <button type="button" onClick={addService} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white/5">
            + Add Service
          </button>
        </div>

        <div className="space-y-3">
          {services.map((row, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-12 rounded-lg border p-3 bg-black/30">
              <div className="sm:col-span-3">
                <span className="block text-xs mb-1 opacity-75">Name</span>
                <input className="w-full rounded-md bg-white/10 p-2" value={row.name} onChange={(e) => updateService(i, { name: e.target.value })} />
              </div>
              <div className="sm:col-span-6">
                <span className="block text-xs mb-1 opacity-75">Description</span>
                <input className="w-full rounded-md bg-white/10 p-2" value={row.description ?? ""} onChange={(e) => updateService(i, { description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs mb-1 opacity-75">Price (USD)</span>
                <input
                  className="w-full rounded-md bg-white/10 p-2"
                  value={row.price ?? ""}
                  onChange={(e) => updateService(i, { price: e.target.value === "" ? "" : Number(e.target.value) })}
                  placeholder="e.g. 199"
                />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <button type="button" onClick={() => removeService(i)} className="w-full rounded-md border px-3 py-2 text-sm hover:bg-white/5">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Start Animation Content */}
      <section className="rounded-xl border p-6 bg-white/5">
        <h2 className="text-lg font-semibold mb-3">Start Animation Content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">Headline</span>
            <input
              className="w-full rounded-md bg-white/10 p-2"
              value={startAnimationHeadline}
              onChange={(e) => setStartAnimationHeadline(e.target.value)}
              placeholder={`Welcome to ${name || "our Front Desk"}`}
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">Subtext</span>
            <input
              className="w-full rounded-md bg-white/10 p-2"
              value={startAnimationSubtext}
              onChange={(e) => setStartAnimationSubtext(e.target.value)}
              placeholder="Ask me about availability, pricing, or booking — I’m here to help."
            />
          </label>
        </div>

        {/* Live Preview */}
        <div className="mt-4 rounded-lg bg-black/30 p-4">
          <div className="text-xl font-bold mb-1">{computedHeadline}</div>
          <div className="opacity-80">{computedSubtext}</div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          Save & Continue
        </button>
        <a href="/dashboard" className="text-sm underline opacity-80 hover:opacity-100">Cancel</a>
      </div>
    </form>
  );
}
