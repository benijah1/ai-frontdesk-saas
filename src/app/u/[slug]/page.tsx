"use client"
import { useState } from "react"

export default function TenantPublicPage({ params }: { params: { slug: string } }) {
  const [theme, setTheme] = useState<{primary:string, accent:string} | null>(null)
  const [org, setOrg] = useState<{name:string, licenseNumber:string|null} | null>(null)
  const [input, setInput] = useState("")
  const [log, setLog] = useState<string[]>([])

  // Fetch minimal info via the realtime endpoint (could also create a dedicated GET /org route)
  async function ensureTenant() {
    if (org) return
    const res = await fetch(`/api/realtime?slug=${params.slug}`)
    if (res.ok) {
      const data = await res.json()
      setOrg({ name: data.tenant.name, licenseNumber: data.tenant.licenseNumber })
      setTheme(data.tenant.theme)
    }
  }

  async function sendMessage() {
    await ensureTenant()
    const res = await fetch(`/api/chat?slug=${params.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: input }] }),
    })
    if (res.ok) {
      const data = await res.json()
      const answer = data.messages?.[0]?.content ?? ""
      setLog((l)=>[...l, `You: ${input}`, `AI: ${answer}`])
      setInput("")
    }
  }

  const primary = theme?.primary ?? "#0ea5e9"
  const accent = theme?.accent ?? "#22c55e"

  return (
    <main className="min-h-screen" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold" style={{ color: primary }}>{org?.name ?? "AI Front Desk"}</h1>
        <p className="text-sm text-gray-600">License: {org?.licenseNumber ?? "N/A"}</p>

        <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: accent }}>
          <h2 className="font-semibold">Chat with us</h2>
          <div className="mt-3 flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message"
              className="flex-1 border rounded px-3 py-2"/>
            <button onClick={sendMessage} className="rounded px-4 py-2 text-white" style={{ background: primary }}>Send</button>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            {log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>
        </div>
      </div>
    </main>
  )
}
