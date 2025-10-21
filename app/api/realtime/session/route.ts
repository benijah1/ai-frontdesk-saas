// app/api/realtime/session/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 })
    }

    // Create an ephemeral client secret for the browser
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1",
      },
      body: JSON.stringify({
        // Use a current realtime-capable model
        model: "gpt-4o-realtime-preview-2024-10-01",
        voice: "alloy",
        // You can set session defaults here if you want:
        // modalities: ["audio", "text"],
        // turn_detection: { type: "server_vad" },
      }),
    })

    const text = await r.text()
    if (!r.ok) {
      console.error("[realtime/session] upstream error:", r.status, text.slice(0, 300))
      return NextResponse.json(
        { error: `Failed to create realtime session (${r.status})` },
        { status: 502 },
      )
    }

    let data: any = {}
    try { data = JSON.parse(text) } catch {}

    const clientSecret = data?.client_secret?.value
    if (!clientSecret) {
      return NextResponse.json({ error: "Missing client_secret in OpenAI response" }, { status: 502 })
    }

    return NextResponse.json({ clientSecret })
  } catch (err) {
    console.error("[realtime/session] error:", err)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
