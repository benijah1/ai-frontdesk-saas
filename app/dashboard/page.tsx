// app/dashboard/page.tsx
import FrontDeskSetupForm from "@/components/FrontDeskSetupForm";

export default async function DashboardPage() {
  // If you fetch user/tenant data here, keep it; this is a minimal example.
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Welcome</h1>

      {/* FRONT DESK SETUP */}
      <div className="mb-8">
        <FrontDeskSetupForm />
      </div>

      {/* Existing dashboard content below — keep your CRM summary, stats, etc. */}
      {/* Example placeholder blocks */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">CRM</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage contacts, pipeline, and follow-ups.
        </p>
        {/* Your existing CRM table/cards render here */}
      </section>
    </main>
  );
}
