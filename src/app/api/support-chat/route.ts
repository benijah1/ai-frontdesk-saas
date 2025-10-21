import { NextResponse } from "next/server"
import { getTenantBySlug, getTenantFromSession } from "@/lib/tenant"

export async function POST(req: Request) {
  const url = new URL(req.url)
  const slug = url.searchParams.get("slug")
  const tenant = slug ? await getTenantBySlug(slug) : await getTenantFromSession()
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

  const { message } = await req.json().catch(()=>({ message: "" }))

  // Stubbed support response; integrate your existing support logic here.
  const reply = `Support (${tenant.name}): We received your message "${message}". We'll follow up shortly.`

  return NextResponse.json({ reply })
}
