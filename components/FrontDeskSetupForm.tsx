"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceRow = { name: string; description?: string; price?: number | "" };
type ApiResponse =
  | { ok: true; tenant: any; startAnimationHeadline?: string; startAnimationSubtext?: string }
  | { error: string; detail?: string };

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

// Ensure "HH:MM" (24h) for API
function normalizeTime(val: string | undefined | null): string | "" {
  if (!val) return "";
  // HTML time input already produces "HH:MM" — just guard length
  const v = String(val).trim();
  if (/^\d{2}:\d{2}$/.test(v)) return v;
  // Fallback: take first 5 to avoid seconds
  return v.slice(0, 5);
}

export default function FrontDeskSetupForm() {
  // Identity / branding
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [pathSlug, setPathSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [secondaryColor, setSecondaryColor] = useState("#111827");
  const [accentColor, setAccentColor] = useState("#22d3ee");
  const [brandFont, setBrandFont] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");

  // Contact / location
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  // Schedule
  const [businessDays, setBusinessDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [openTime, setOpenTime] = useState<string>("09:00");
  const [closeTime, setCloseTime] = useState<string>("17:00");
  const [hoursJson, setHoursJson] = useState("");

  // Copy / AI
  const [greeting, setGreeting] = useState("");
  const [voice, setVoice] = useState("");
  const [startAnimationHeadline, setStartAnimationHeadline] = useState("");
  const [startAnimationSubtext, setStartAnimationSubtext] = useState("");

  // Business details
  const [licenseNumber, setLicenseNumber] = useState("");
  const [awards, setAwards] = useState<string[]>([]);

  // Services
  const [services, setServices] = useState<ServiceRow[]>([{ name: "", description: "", price: "" }]);

  // UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Derived slugs
  const subdomainPreview = useMemo(() => (subdomain ? slugify(subdomain) : ""), [subdomain]);
  const pathSlugPreview = useMemo(() => (pathSlug ? slugify(pathSlug) : slugify(name)), [pathSlug, name]);

  function toggleDay(day: string) {
    setBusinessDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => ALL_DAYS.indexOf(a as any) - ALL_DAYS.indexOf(b as any))
    );
  }

  function updateService(idx: number, patch: Partial<ServiceRow>) {
    setServices((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function addService() {
    setServices((rows) => [...rows, { name: "", description: "", price: "" }]);
  }

  function removeService(idx: number) {
    setServices((rows) => rows.filter((_, i) => i !== idx));
  }

  function parseAwardsInput(v: string) {
    const parts = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setAwards(parts);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);

    try {
      const payload = {
        // Identity / theme
        name: name.trim(),
        subdomain: subdomainPreview || undefined,
        pathSlug: pathSlugPreview || undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        brandFont: brandFont || undefined,
        logoUrl: logoUrl || undefined,

        // Contact / location
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zip: zip || undefined,

        // Hours & schedule
        businessDays,
        openTime: normalizeTime(openTime) || undefined,
        closeTime: normalizeTime(closeTime) || undefined,
        hoursJson: hoursJson || undefined,

        // Copy / AI
        greeting: greeting || undefined,
        voice: voice || undefined,
        startAnimationHeadline: startAnimationHeadline || undefined,
        startAnimationSubtext: startAnimationSubtext || undefined,

        // Other details
        licenseNumber: licenseNumber || undefined,
        awards,

        // Services array for relation upsert
        services: services
          .map((s) => ({
            name: String(s.name || "").trim(),
            description: String(s.description || "").trim() || undefined,
            price:
              s.price === "" || s.price == null
                ? null
                : typeof s.price === "number"
                ? s.price
                : Number.isFinite(Number(s.price))
                ? Number(s.price)
                : null,
          }))
          .filter((s) => s.name),
      };

      const res = await fetch("/api/tenant/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();
      if (!res.ok || (data as any).error) {
        throw new Error((data as any).detail || (data as any).error || "Failed to save");
      }
      setOkMsg("Saved! Your business hours and settings are updated.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">AI Front Desk — Setup</h2>
        <p className="mt-1 text-sm text-white/60">
          Company info, branding, services, and <span className="font-medium">business hours</span>.
        </p>
      </div>

      {/* Identity / Branding */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Identity & Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Business Name *</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Logo URL</span>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Primary Color</span>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-16 rounded" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-white/70">Secondary Color</span>
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-16 rounded" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-white/70">Accent Color</span>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 w-16 rounded" />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Brand Font</span>
            <input value={brandFont} onChange={(e) => setBrandFont(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Subdomain (preview)</span>
            <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="e.g. fixit"
                   className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
            {subdomainPreview && <span className="text-xs text-white/50">https://{subdomainPreview}.yourapp.com</span>}
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Path Slug (preview)</span>
            <input value={pathSlug} onChange={(e) => setPathSlug(e.target.value)} placeholder="e.g. fixit-bathworks"
                   className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
            {pathSlugPreview && <span className="text-xs text-white/50">/t/{pathSlugPreview}</span>}
          </label>
        </div>
      </section>

      {/* Contact / Location */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Contact & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">License #</span>
            <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="md:col-span-2 grid gap-1">
            <span className="text-sm text-white/70">Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">State</span>
            <input value={state} onChange={(e) => setStateVal(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">ZIP</span>
            <input value={zip} onChange={(e) => setZip(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
        </div>
      </section>

      {/* Hours & Business Days */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Hours & Availability</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Open Time</span>
            <input
              type="time"
              step={60}
              value={openTime}
              onChange={(e) => setOpenTime(normalizeTime(e.target.value))}
              className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Close Time</span>
            <input
              type="time"
              step={60}
              value={closeTime}
              onChange={(e) => setCloseTime(normalizeTime(e.target.value))}
              className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-white/70">Business Days</span>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const active = businessDays.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1 rounded-full border ${
                      active ? "bg-white text-black border-white" : "bg-black/30 text-white/80 border-white/10"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Hours JSON (optional)</span>
          <textarea
            value={hoursJson}
            onChange={(e) => setHoursJson(e.target.value)}
            placeholder='e.g. {"Mon":{"open":"09:00","close":"17:00"}, ...}'
            className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10 min-h-[90px]"
          />
        </label>
      </section>

      {/* Copy / AI */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Assistant Copy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Greeting</span>
            <input value={greeting} onChange={(e) => setGreeting(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Voice (optional)</span>
            <input value={voice} onChange={(e) => setVoice(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1 md:col-span-1">
            <span className="text-sm text-white/70">Start Headline</span>
            <input value={startAnimationHeadline} onChange={(e) => setStartAnimationHeadline(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
          <label className="grid gap-1 md:col-span-1">
            <span className="text-sm text-white/70">Start Subtext</span>
            <input value={startAnimationSubtext} onChange={(e) => setStartAnimationSubtext(e.target.value)} className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10" />
          </label>
        </div>
      </section>

      {/* Awards */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Awards / Badges</h3>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Comma-separated</span>
          <input
            placeholder="Best of 2024, A+ BBB, 5-Star Yelp"
            onChange={(e) => parseAwardsInput(e.target.value)}
            className="rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
          />
        </label>
      </section>

      {/* Services */}
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Services</h3>
          <button type="button" onClick={addService} className="rounded-lg bg-white text-black px-3 py-2">
            + Add Service
          </button>
        </div>

        <div className="space-y-3">
          {services.map((s, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              <input
                placeholder="Name *"
                value={s.name}
                onChange={(e) => updateService(idx, { name: e.target.value })}
                className="md:col-span-3 rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
              />
              <input
                placeholder="Description"
                value={s.description || ""}
                onChange={(e) => updateService(idx, { description: e.target.value })}
                className="md:col-span-6 rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
              />
              <input
                placeholder="Price"
                inputMode="decimal"
                value={s.price}
                onChange={(e) => {
                  const raw = e.target.value;
                  const val = raw === "" ? "" : Number(raw);
                  updateService(idx, { price: isNaN(val as number) ? "" : (val as number) });
                }}
                className="md:col-span-2 rounded-lg bg-black/30 px-3 py-2 outline-none border border-white/10"
              />
              <button
                type="button"
                onClick={() => removeService(idx)}
                className="md:col-span-1 rounded-lg border border-white/10 px-3 py-2 text-white/80 hover:bg-white/10"
                aria-label={`Remove service ${idx + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white text-black px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {okMsg && <span className="text-emerald-400">{okMsg}</span>}
        {error && <span className="text-rose-400">{error}</span>}
      </div>

      {/* Preview */}
      <div className="text-sm text-white/60">
        <div>Open: <span className="text-white">{normalizeTime(openTime) || "—"}</span></div>
        <div>Close: <span className="text-white">{normalizeTime(closeTime) || "—"}</span></div>
        <div>Days: <span className="text-white">{businessDays.length ? businessDays.join(", ") : "—"}</span></div>
      </div>
    </form>
  );
}
