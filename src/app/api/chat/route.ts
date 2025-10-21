import { NextResponse } from "next/server"
import { getTenantBySlug, getTenantFromSession } from "@/lib/tenant"

// Example chat endpoint that accepts optional ?slug= for public use or uses session org
export async function POST(req: Request) {
  const url = new URL(req.url)
  const slug = url.searchParams.get("slug")
  const tenant = slug ? await getTenantBySlug(slug) : await getTenantFromSession()
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

  const body = await req.json().catch(()=>({ messages: [] }))
  const messages = body?.messages ?? []

  // Inject tenant context into system message
  const system = {
    role: "system",
    content: `You are the AI Front Desk for ${tenant.name} (license: ${tenant.licenseNumber ?? "N/A"}).
Theme primary: ${tenant.theme.primary}, accent: ${tenant.theme.accent}.
Always answer professionally, capture lead info when appropriate (name, phone, service needed, address).`,
  }

  // NOTE: Wire this to your existing model/provider as needed.
  // Here we just echo back a stub for demonstration.
  const lastUser = messages.filter((m: any)=>m.role==="user").slice(-1)[0]?.content ?? "Hello"
  const reply = `Thanks for contacting ${tenant.name}! How can we help you with ${lastUser}?`

  return NextResponse.json({ messages: [{ role: "assistant", content: reply }] })
}
