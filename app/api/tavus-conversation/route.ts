// app/api/tavus-conversation/route.ts
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge" as const // optional; remove if you don't want Edge

const API_BASE = "https://tavusapi.com/v2"
const DEFAULT_REPLICA_ID = "rca8a38779a8" // fallback; prefer env in production

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 15000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  const nextInit: RequestInit = { ...init, signal: ctrl.signal }
  return fetch(input, nextInit).finally(() => clearTimeout(id))
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating Tavus conversation...")

    const TAVUS_API_KEY = process.env.TAVUS_API_KEY
    if (!TAVUS_API_KEY) {
      return NextResponse.json({ success: false, error: "TAVUS_API_KEY not configured" }, { status: 500 })
    }

    // Prefer setting this in Vercel: TAVUS_REPLICA_ID=rca8a38779a8
    const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID || DEFAULT_REPLICA_ID

    // If your /api/tavus-persona endpoint requires an internal key, pass it through
    const INTERNAL_ROUTE_KEY = process.env.INTERNAL_ROUTE_KEY

    // 1) Fetch (or create) the persona from your internal route
    const baseUrl = new URL(request.url).origin
    const personaResponse = await fetchWithTimeout(
      `${baseUrl}/api/tavus-persona`,
      {
        method: "GET",
        headers: INTERNAL_ROUTE_KEY ? { "x-internal-key": INTERNAL_ROUTE_KEY } : {},
      },
      20000,
    )

    if (!personaResponse.ok) {
      const text = await personaResponse.text().catch(() => "")
      throw new Error(`Failed to get persona (${personaResponse.status}): ${text.slice(0, 400)}`)
    }

    const personaData = await personaResponse.json().catch(() => ({}) as any)
    const personaId: string | undefined = personaData?.persona?.persona_id
    if (!personaId) {
      throw new Error("Persona ID missing from /api/tavus-persona response")
    }

    console.log("[v0] Using persona ID:", personaId)

    const APP_BASE_URL = process.env.APP_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

    // 2) Create conversation — IMPORTANT: include replica_id to avoid "Invalid replica_uuid"
    const createBody = {
      persona_id: personaId,
      replica_id: TAVUS_REPLICA_ID,
      callback_url: `${APP_BASE_URL}/api/tavus-webhook`,
    }

    const res = await fetchWithTimeout(
      `${API_BASE}/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAVUS_API_KEY,
        },
        body: JSON.stringify(createBody),
      },
      20000,
    )

    const text = await res.text().catch(() => "")
    if (!res.ok) {
      console.error("[v0] Tavus API error:", res.status, text.slice(0, 300))
      throw new Error(`Tavus API error: ${res.status} ${text.slice(0, 400)}`)
    }

    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      data = {}
    }

    const conversation_url = data?.conversation_url
    const conversation_id = data?.conversation_id
    if (!conversation_url || !conversation_id) {
      throw new Error("Conversation created but missing conversation_url or conversation_id")
    }

    console.log("[v0] Tavus conversation created successfully:", conversation_url)

    // Keep snake_case to match your current client code
    return NextResponse.json({
      success: true,
      conversation_url,
      conversation_id,
    })
  } catch (error) {
    console.error("[v0] Error creating Tavus conversation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create video conversation",
      },
      { status: 500 },
    )
  }
}
