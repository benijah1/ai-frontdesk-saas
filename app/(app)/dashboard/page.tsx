// app/(app)/dashboard/page.tsx
import FrontDeskSetupForm from "@/components/FrontDeskSetupForm";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Welcome</h1>

      {/* Front Desk Setup */}
      <div className="mb-8">
        <FrontDeskSetupForm />
      </div>

      {/* Existing dashboard content */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">CRM</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage contacts, pipeline, and follow-ups.
        </p>
        {/* …your CRM table/cards… */}
      </section>
    </main>
  );
}
