export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-xl border bg-white p-4">
        <div className="font-semibold mb-2">Brand color</div>
        <input type="color" defaultValue="#0ea5e9" className="h-10 w-16 p-1 border rounded" />
      </div>
    </div>
  );
}
