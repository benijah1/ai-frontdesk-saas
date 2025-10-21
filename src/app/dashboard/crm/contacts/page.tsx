"use client"
import { useEffect, useState } from "react"

export default function CRMContacts() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  async function load() {
    const res = await fetch("/api/crm/contacts")
    if (res.ok) setItems((await res.json()).contacts)
  }

  async function add() {
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    })
    if (res.ok) {
      setName(""); setEmail(""); setPhone(""); load()
    }
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="Name" className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" className="border rounded px-2 py-1" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Phone" className="border rounded px-2 py-1" value={phone} onChange={e=>setPhone(e.target.value)} />
        <button onClick={add} className="rounded px-3 py-1 text-white" style={{background:"#111"}}>Add</button>
      </div>
      <div className="grid gap-2">
        {items.map(i=> (
          <div key={i.id} className="border rounded px-3 py-2">
            <div className="font-medium">{i.name ?? "(no name)"}</div>
            <div className="text-sm text-gray-600">{i.email ?? ""} {i.phone ? `• ${i.phone}` : ""}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
