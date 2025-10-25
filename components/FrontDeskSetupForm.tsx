"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceRow = { name: string; description?: string; price?: number | "" };

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export default function FrontDeskSetupForm() {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [pathSlug, setPathSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [services, setServices] = useState<ServiceRow[]>([
    { name: "", description: "", price: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "idle" | "ok" | "err"; text?: string }>({
    type: "idle",
  });

  // Derive defaults as the user types
  useEffect(() => {
    if (!subdomain) setSubdomain(slugify(name));
    if (!pathSlug) setPathSlug(slugify(name));
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const hostPreview = useMemo(() => {
    if (typeof window === "undefined") return "";
    // If you use wildcard subdomains in production, this gives a realistic preview.
    const baseHost = window.location.host
      .replace(/^www\./, "")
      .replace(/^app\./, "");
    const protocol = window.location.protocol || "https:";
    const sd = subdomain || "your-subdomain";
    const slug = pathSlug || "your-slug";
    return {
      subdomainUrl: `${protocol}//${sd}.${baseHost}/`,
      pathUrl: `${protocol}//${baseHost}/t/${slug}`,
    };
  }, [subdomain, pathSlug]);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ type: "idle" });
    setSaving(true);
    try {
      const payload = {
        name,
        subdomain: subdomain ? slugify(subdomain) : undefined,
        pathSlug: pathSlug ? slugify(pathSlug) : undefined,
        primaryColor,
        branding: {
          logoUrl: logoUrl || undefined,
          accentColor: accentColor || undefined,
        },
        services: services
          .map((s) => ({
            name: (s.name || "").trim(),
            description: (s.description || "").trim() || undefined,
            price:
              typeof s.price === "number"
                ? s.price
                : s.price === ""
                ? undefined
                : Number.isNaN(Number(s.price))
                ? undefined
                : Number(s.price),
          }))
          .filter((s) => s.name),
      };

      const res = await fetch("/api/tenant/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.error || "Request failed");

      setMsg({ type: "ok", text: "Front Desk configured!" });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold">Front Desk Setup</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure your company profile, branding, and services. We’ll create a unique URL for your Front Desk.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8 p-6">
        {/* Company */}
        <section className="space-y-4">
          <h3 className="text-base font-medium">Company</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Business name *</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fix It Bathworks"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Primary color</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-md border border-slate-300 px-2 py-1"
                title={primaryColor}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Logo URL</span>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://cdn.yoursite.com/logo.png"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Accent color</span>
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#f59e0b"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
          </div>
        </section>

        {/* URLs */}
        <section className="space-y-4">
          <h3 className="text-base font-medium">Unique URL</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Subdomain</span>
              <input
                value={subdomain}
                onChange={(e) => setSubdomain(slugify(e.target.value))}
                placeholder="fixit"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Path slug</span>
              <input
                value={pathSlug}
                onChange={(e) => setPathSlug(slugify(e.target.value))}
                placeholder="fixit"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>

            <div className="flex flex-col justify-end">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Preview:</span>{" "}
                <span className="whitespace-nowrap underline decoration-dotted">
                  {hostPreview.subdomainUrl}
                </span>{" "}
                or{" "}
                <span className="whitespace-nowrap underline decoration-dotted">
                  {hostPreview.pathUrl}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="space-y-4">
          <h3 className="text-base font-medium">Services</h3>

          <div className="space-y-3">
            {services.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-12"
              >
                <input
                  className="col-span-12 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-3"
                  placeholder="Service name"
                  value={row.name}
                  onChange={(e) => updateService(idx, { name: e.target.value })}
                />
                <input
                  className="col-span-12 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-7"
                  placeholder="Description"
                  value={row.description || ""}
                  onChange={(e) => updateService(idx, { description: e.target.value })}
                />
                <input
                  className="col-span-9 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-1"
                  placeholder="Price"
                  inputMode="decimal"
                  value={row.price === "" ? "" : row.price}
                  onChange={(e) =>
                    updateService(idx, {
                      price: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="col-span-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:col-span-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addService}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Add service
          </button>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Front Desk"}
          </button>

          {msg.type === "ok" && (
            <span className="text-sm text-emerald-600">{msg.text}</span>
          )}
          {msg.type === "err" && (
            <span className="text-sm text-red-600">{msg.text}</span>
          )}
        </div>
      </form>
    </div>
  );
}
