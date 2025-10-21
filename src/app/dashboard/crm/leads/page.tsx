"use client"
import { useEffect, useState } from "react"

export default function CRMLeads() {
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [value, setValue] = useState<number | "">("")
  const [status, setStatus] = useState("new")

  async function load() {
    const res = await fetch("/api/crm/leads")
    if (res.ok) setItems((await res.json()).leads)
  }

  async function add() {
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, value: value===""?null:Number(value), status })
    })
    if (res.ok) {
      setTitle(""); setValue(""); setStatus("new"); load()
    }
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="Title" className="border rounded px-2 py-1" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Value" className="border rounded px-2 py-1" value={value} onChange={e=>setValue(e.target.value === '' ? '' : Number(e.target.value))} />
        <select className="border rounded px-2 py-1" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="qualified">qualified</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
        </select>
        <button onClick={add} className="rounded px-3 py-1 text-white" style={{background:"#111"}}>Add</button>
      </div>
      <div className="grid gap-2">
        {items.map(i=> (
          <div key={i.id} className="border rounded px-3 py-2">
            <div className="font-medium">{i.title ?? "(untitled)"} — <span className="text-xs">{i.status}</span></div>
            <div className="text-sm text-gray-600">{i.contact?.name ?? ""} {i.value ? `• $${i.value}` : ""}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
