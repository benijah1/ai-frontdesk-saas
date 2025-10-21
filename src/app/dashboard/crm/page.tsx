import Link from "next/link"

export default function CRMIndex() {
  return (
    <div className="grid gap-3">
      <Link href="/dashboard/crm/contacts" className="border rounded px-3 py-2">Contacts</Link>
      <Link href="/dashboard/crm/leads" className="border rounded px-3 py-2">Leads</Link>
      <Link href="/dashboard/crm/stages" className="border rounded px-3 py-2">Pipeline Stages</Link>
    </div>
  )
}
