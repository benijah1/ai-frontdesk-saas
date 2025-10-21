import { type NextRequest, NextResponse } from "next/server"

function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  const merged: RequestInit = { ...init, signal: controller.signal }
  return fetch(url, merged).finally(() => clearTimeout(id))
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Ending Tavus conversation")

    const TAVUS_API_KEY = process.env.TAVUS_API_KEY
    if (!TAVUS_API_KEY) {
      return NextResponse.json({ success: false, error: "TAVUS_API_KEY not configured" }, { status: 500 })
    }

    // Parse body safely
    const body = await request.json().catch(() => ({}) as any)
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId.trim() : ""

    if (!conversationId) {
      console.error("[v0] No conversation ID provided")
      return NextResponse.json({ success: false, error: "Conversation ID is required" }, { status: 400 })
    }

    console.log("[v0] Ending conversation:", conversationId)

    const res = await fetchWithTimeout(
      `https://tavusapi.com/v2/conversations/${encodeURIComponent(conversationId)}/end`,
      {
        method: "POST",
        headers: {
          "x-api-key": TAVUS_API_KEY,
          // No body needed; omit Content-Type
        },
      },
      20000, // 20s timeout
    ).catch((e) => {
      throw new Error(`Network error ending conversation: ${String(e)}`)
    })

    const text = await res.text().catch(() => "")

    console.log("[v0] Tavus end conversation response status:", res.status)

    if (!res.ok) {
      console.error("[v0] Tavus API error:", res.status, text.slice(0, 300))
      return NextResponse.json(
        { success: false, error: `Tavus API error: ${res.status}`, details: text.slice(0, 1000) },
        { status: res.status === 0 ? 502 : res.status },
      )
    }

    console.log("[v0] Conversation ended successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error ending Tavus conversation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to end conversation",
      },
      { status: 500 },
    )
  }
}
