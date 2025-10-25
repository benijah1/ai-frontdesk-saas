"use client";

import { useMemo, useState } from "react";

type ServiceRow = {
  name: string;
  description?: string;
  price?: number | "";
};

type SetupInitialData = {
  name?: string;
  phone?: string;
  websiteUrl?: string;
  licenseNumber?: string;
  businessDays?: string[]; // e.g., ["Mon","Tue","Wed"]
  openTime?: string; // "09:00"
  closeTime?: string; // "17:00"
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  services?: ServiceRow[];
  subdomain?: string;
  pathSlug?: string;
};

type Props = {
  initialData?: SetupInitialData;
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export default function FrontDeskSetupForm({ initialData }: Props) {
  // ----- Seeds from initialData (all optional) -----
  const [name, setName] = useState(initialData?.name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialData?.licenseNumber ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor ?? "#0ea5e9");
  const [accentColor, setAccentColor] = useState(initialData?.accentColor ?? "");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl ?? "");
  const [openTime, setOpenTime] = useState(initialData?.openTime ?? "09:00");
  const [closeTime, setCloseTime] = useState(initialData?.closeTime ?? "17:00");
  const [businessDays, setBusinessDays] = useState<string[]>(
    initialData?.businessDays && initialData.businessDays.length ? initialData.businessDays : ["Mon","Tue","Wed","Thu","Fri"]
  );
  const [subdomain, setSubdomain] = useState(initialData?.subdomain ?? "");
  const [pathSlug, setPathSlug] = useState(initialData?.pathSlug ?? "");
  const [services, setServices] = useState<ServiceRow[]>(
    initialData?.services?.length ? initialData.services : [{ name: "", description: "", price: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Compute a suggested slug from name if empty
  const suggestedSlug = useMemo(() => (pathSlug ? pathSlug : slugify(name)), [name, pathSlug]);

  function toggleDay(day: string) {
    setBusinessDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function updateService(index: number, patch: Partial<ServiceRow>) {
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addService() {
    setServices((prev) => [...prev, { name: "", description: "", price: "" }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setSaving(true);

    try {
      const payload = {
        name,
        phone,
        websiteUrl,
        licenseNumber,
        businessDays: businessDays.sort(
          (a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b)
        ),
        openTime,
        closeTime,
        primaryColor,
        accentColor,
        logoUrl,
        services: services
          .filter((s) => s.name?.trim())
          .map((s) => ({
            name: s.name.trim(),
            description: s.description?.trim() || undefined,
            price:
              s.price === "" || s.price === undefined
                ? undefined
                : Number(s.price),
          })),
        subdomain: subdomain?.trim() || undefined,
        pathSlug: (pathSlug?.trim() || suggestedSlug || "").slice(0, 64),
      };

      const res = await fetch("/api/tenant/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      const json = await res.json().catch(() => ({}));
      setOkMsg("Saved! Your AI Front Desk has been updated.");
      // Optionally: route to dashboard or show link from JSON
      // e.g., if API returns { url: "/dashboard" } you could:
      // router.push(json?.url || "/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Top row: Company + URL bits */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fix It Bathworks"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">License Number</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="ABC-123456"
          />
        </div>
      </section>

      {/* Multi-tenant routing */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Subdomain (optional)</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={subdomain}
            onChange={(e) => setSubdomain(slugify(e.target.value))}
            placeholder="yourbrand"
          />
          <p className="mt-1 text-xs text-slate-500">Will be used for <code>yourbrand.example.com</code> if subdomain routing is enabled.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Path Slug</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={pathSlug}
            onChange={(e) => setPathSlug(slugify(e.target.value))}
            placeholder={suggestedSlug || "yourbrand"}
          />
          <p className="mt-1 text-xs text-slate-500">Defaults to a slugified version of the company name.</p>
        </div>
      </section>

      {/* Hours & Days */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Open Time</label>
          <input
            type="time"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Close Time</label>
          <input
            type="time"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Business Days</label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((d) => {
              const active = businessDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={[
                    "px-3 py-1 rounded-full border text-sm",
                    active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <input
            type="color"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">{primaryColor}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Accent Color</label>
          <input
            type="color"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white"
            value={accentColor || "#94a3b8"}
            onChange={(e) => setAccentColor(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">{accentColor || "#94a3b8"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://cdn.example.com/logo.png"
          />
        </div>
      </section>

      {/* Services editor */}
      <section>
        <label className="block text-sm font-medium mb-2">Services</label>
        <div className="space-y-3">
          {services.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              <input
                className="md:col-span-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                placeholder="Service name"
                value={row.name}
                onChange={(e) => updateService(idx, { name: e.target.value })}
              />
              <input
                className="md:col-span-7 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                placeholder="Description"
                value={row.description ?? ""}
                onChange={(e) => updateService(idx, { description: e.target.value })}
              />
              <input
                className="md:col-span-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                value={row.price === "" ? "" : row.price}
                onChange={(e) => updateService(idx, { price: e.target.value === "" ? "" : Number(e.target.value) })}
              />
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  aria-label={`Remove service ${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={addService}
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            + Add service
          </button>
        </div>
      </section>

      {/* Save button + status */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {okMsg && <span className="text-sm text-emerald-600">{okMsg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
