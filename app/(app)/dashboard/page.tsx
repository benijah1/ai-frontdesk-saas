export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="font-semibold">Today’s Calls</div>
          <div className="text-3xl mt-2">0</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="font-semibold">New Leads</div>
          <div className="text-3xl mt-2">0</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="font-semibold">Bookings</div>
          <div className="text-3xl mt-2">0</div>
        </div>
      </div>
    </div>
  );
}
