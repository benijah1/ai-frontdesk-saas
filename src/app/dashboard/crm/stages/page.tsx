"use client"
import { useEffect, useState } from "react"

export default function CRMStages() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState("")
  const [order, setOrder] = useState<number | "">("")

  async function load() {
    const res = await fetch("/api/crm/stages")
    if (res.ok) setItems((await res.json()).stages)
  }

  async function add() {
    const res = await fetch("/api/crm/stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, order: order===""?0:Number(order) })
    })
    if (res.ok) { setName(""); setOrder(""); load() }
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="Stage name" className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Order" className="border rounded px-2 py-1" value={order} onChange={e=>setOrder(e.target.value === '' ? '' : Number(e.target.value))} />
        <button onClick={add} className="rounded px-3 py-1 text-white" style={{background:"#111"}}>Add</button>
      </div>
      <div className="grid gap-2">
        {items.map(i=> (
          <div key={i.id} className="border rounded px-3 py-2">
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-gray-600">order: {i.order}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
