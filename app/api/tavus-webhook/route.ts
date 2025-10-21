// app/api/tavus-webhook/route.ts
import { NextResponse } from "next/server"

export const runtime = "nodejs" as const // webhook + SMTP are Node runtime friendly

// Optional: lightweight event type guard
type TavusMessage = { role: "user" | "assistant" | "system"; content: string; timestamp?: string }
type TavusTranscriptionPayload = {
  type: string // "application.transcription_ready"
  data?: {
    conversation_id?: string
    messages?: TavusMessage[] // role-based transcript
    started_at?: string
    ended_at?: string
    user?: { name?: string; email?: string; phone?: string; city?: string } // if Tavus includes it
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as TavusTranscriptionPayload

    // Tavus can send multiple event types; we only act on transcription_ready
    if (payload?.type !== "application.transcription_ready") {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const convId = payload?.data?.conversation_id || undefined
    const startedAt = payload?.data?.started_at
    const endedAt = payload?.data?.ended_at

    // Build a plain-text transcript for the email summarizer (nice, robust fallback)
    const messages = payload?.data?.messages ?? []
    const videoTranscript = messages
      .map((m) => `[${m.role}] ${m.content}`)
      .join("\n")

    // Also build a Message[] so your summarizer can use structured chat if needed
    const structuredMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m, i) => ({
        id: String(i + 1),
        content: m.content,
        role: m.role as "user" | "assistant",
        timestamp: new Date().toISOString(),
      }))

    // Forward to your SMTP summary route
    // NOTE: we call the route inside the same app so it uses your Gmail settings.
    const baseUrl = process.env.APP_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    if (!baseUrl) {
      console.warn("[tavus-webhook] APP_BASE_URL/VERCEL_URL not set; falling back to relative fetch (may fail off-host)")
    }

    // Optional: internal key to prevent public abuse
    const INTERNAL_ROUTE_KEY = process.env.INTERNAL_ROUTE_KEY

    await fetch(`${baseUrl || ""}/api/summary-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_ROUTE_KEY ? { "x-internal-key": INTERNAL_ROUTE_KEY } : {}),
      },
      body: JSON.stringify({
        channel: "video",
        conversationId: convId,
        startedAt,
        endedAt,
        // Give both structured messages + raw transcript for best summary
        messages: structuredMessages,
        videoTranscript,
        // You can also pass any user fields if Tavus sends them to you
        userContact: payload?.data?.user,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[tavus-webhook] error", err)
    return NextResponse.json({ ok: false, error: "Webhook handling failed" }, { status: 500 })
  }
}
