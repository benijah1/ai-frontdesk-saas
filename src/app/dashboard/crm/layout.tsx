export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">CRM</h1>
      <div className="mt-6">{children}</div>
    </div>
  )
}
