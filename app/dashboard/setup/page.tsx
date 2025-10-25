// app/dashboard/setup/page.tsx
"use client";

import * as React from "react";

export default function SetupPage() {
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/tenant/setup", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to save");
      }

      const json = (await res.json()) as { ok: boolean; url?: string };
      setMessage("Saved! Redirecting...");
      if (json.url) {
        // Small delay so the user sees the toast
        setTimeout(() => {
          window.location.href = json.url!;
        }, 400);
      }
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Company Setup</h1>

        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Company Name *</label>
              <input
                name="name"
                required
                className="w-full h-10 px-3 rounded border border-slate-300"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Subdomain</label>
              <input
                name="subdomain"
                className="w-full h-10 px-3 rounded border border-slate-300"
                placeholder="acme"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Primary</label>
              <input
                name="primaryColor"
                type="color"
                defaultValue="#0ea5e9"
                className="w-full h-10 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Secondary</label>
              <input
                name="secondaryColor"
                type="color"
                defaultValue="#111827"
                className="w-full h-10 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Accent</label>
              <input
                name="accentColor"
                type="color"
                defaultValue="#22d3ee"
                className="w-full h-10 rounded"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Brand Font</label>
              <input name="brandFont" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="Inter" />
            </div>
            <div>
              <label className="block text-sm mb-1">Logo URL</label>
              <input name="logoUrl" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="https://..." />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input name="phone" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="(555) 555-5555" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input name="email" type="email" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="hello@acme.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Address</label>
            <input name="address" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="123 Main St, Springfield" />
          </div>

          <div>
            <label className="block text-sm mb-1">Hours (JSON)</label>
            <textarea name="hoursJson" rows={3} className="w-full px-3 py-2 rounded border border-slate-300" placeholder='{"mon":{"open":"09:00","close":"17:00"}}' />
          </div>

          <div>
            <label className="block text-sm mb-1">Greeting</label>
            <input name="greeting" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="Hi! How can I help?" />
          </div>

          <div>
            <label className="block text-sm mb-1">Voice (optional)</label>
            <input name="voice" className="w-full h-10 px-3 rounded border border-slate-300" placeholder="alloy" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center h-10 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            {message ? <span className="text-sm">{message}</span> : null}
          </div>
        </form>
      </div>
    </main>
  );
}
