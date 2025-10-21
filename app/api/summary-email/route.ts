// app/api/summary-email/route.ts
import { NextResponse, NextRequest } from "next/server"
// import nodemailer from "nodemailer"
import * as nodemailer from "nodemailer";
import MarkdownIt from "markdown-it"

export const runtime = "nodejs" as const // Nodemailer needs Node runtime (not Edge)

// Required ENV (set in Vercel):
// OPENAI_API_KEY
// GMAIL_USER            -> your Gmail address (e.g., you@example.com)
// GMAIL_APP_PASSWORD    -> Gmail App Password (NOT your normal password; requires 2FA)
// SUMMARY_TO            -> where to send the summary (e.g., you@example.com)
// SUMMARY_FROM          -> optional pretty from, defaults to GMAIL_USER if not set

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const SUMMARY_TO = process.env.SUMMARY_TO
const SUMMARY_FROM = process.env.SUMMARY_FROM || (GMAIL_USER ?? "")

type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp?: string | Date
}

type Payload = {
  channel: "message" | "voice" | "video"
  messages?: ChatMessage[]
  voiceTranscript?: string
  videoTranscript?: string
  userContact?: { name?: string; email?: string; phone?: string; city?: string }
  conversationId?: string
  startedAt?: string
  endedAt?: string
}

function getClientIp(req: NextRequest): string {
  const h = req.headers
  const xff = h.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return h.get("cf-connecting-ip") || h.get("x-real-ip") || "unknown"
}

function clamp(s: string, max = 120_000) {
  return s.length > max ? s.slice(0, max) + "\n\n…(truncated)" : s
}

async function summarizeWithOpenAI(payload: Payload) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured")

  const blocks: string[] = []
  if (payload.messages?.length) {
    const m = payload.messages
      .map((x) => `- **${x.role.toUpperCase()}**: ${x.content}`)
      .join("\n")
    blocks.push(`### Chat Messages\n${m}`)
  }
  if (payload.voiceTranscript) blocks.push(`### Voice Transcript\n${payload.voiceTranscript}`)
  if (payload.videoTranscript) blocks.push(`### Video Transcript\n${payload.videoTranscript}`)

  const raw = clamp(blocks.join("\n\n"))

  const system = `
You are a customer support scribe for Fix It! Home Services (bathroom remodeling, plumbing, HVAC).
Write a concise manager-ready email summary (plain text Markdown, <= 500 words).
Focus on: who the user is, location/contact if stated, problem description, constraints/timeline/budget,
key answers given, promised follow-ups/meeting, and clear next steps.
Use short sections with labels and bullet lists. Do NOT include any secrets or API keys.
`.trim()

  const body = {
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content:
          `Channel: ${payload.channel ?? "message"}\n` +
          `ConversationId: ${payload.conversationId ?? "N/A"}\n` +
          `Started: ${payload.startedAt ?? "N/A"}  Ended: ${payload.endedAt ?? "N/A"}\n` +
          `Contact Provided: ${[
            payload.userContact?.name && `name=${payload.userContact.name}`,
            payload.userContact?.email && `email=${payload.userContact.email}`,
            payload.userContact?.phone && `phone=${payload.userContact.phone}`,
            payload.userContact?.city && `city=${payload.userContact.city}`,
          ]
            .filter(Boolean)
            .join(", ") || "none"}\n\n` +
          (raw || "No transcripts or messages were provided."),
      },
    ],
    max_output_tokens: 600,
    temperature: 0.2,
  }

  // 30s timeout to avoid hanging the route
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 30_000)

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ac.signal,
    })

    if (!res.ok) {
      const t = await res.text().catch(() => "")
      throw new Error(`OpenAI summarize error: ${res.status} ${t.slice(0, 300)}`)
    }

    const json = await res.json()
    const summary: string =
      json.output_text ??
      json.output?.find((x: any) => x.type === "message")?.content?.[0]?.text ??
      json?.data?.[0]?.content?.[0]?.text ??
      "Summary unavailable."
    return String(summary)
  } finally {
    clearTimeout(timer)
  }
}

const md = new MarkdownIt({
  html: false, // prevent raw HTML injection
  linkify: true,
  breaks: true,
})

function renderEmailHTML(markdown: string) {
  const content = md.render(markdown)
  // Simple, safe-ish email CSS
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
      body { margin:0; padding:24px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; line-height:1.55; color:#111; }
      h1,h2,h3 { margin: 0 0 8px; }
      h1 { font-size: 20px; }
      h2 { font-size: 18px; }
      h3 { font-size: 16px; }
      p { margin: 0 0 12px; }
      ul,ol { margin: 0 0 12px 20px; padding: 0; }
      code { font-family: ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace; background:#f2f2f2; padding:0 3px; border-radius:3px; }
      a { color: #0b5fff; text-decoration: none; }
      .wrap { max-width: 760px; }
      .meta { color:#555; font-size: 13px; margin-bottom: 16px; }
      .hr { height:1px; background:#e5e5e5; margin:16px 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      ${content}
    </div>
  </body>
</html>`
}

function buildMarkdownEmail({
  ip,
  payload,
  aiSummary,
}: {
  ip: string
  payload: Payload
  aiSummary: string
}) {
  const parts: string[] = []

  // Header (no JSON—human friendly)
  const lines: string[] = []
  lines.push(`**User IP:** ${ip}`)
  lines.push(`**Channel:** ${payload.channel ?? "message"}`)
  if (payload.conversationId) lines.push(`**Conversation ID:** ${payload.conversationId}`)
  if (payload.startedAt) lines.push(`**Started:** ${payload.startedAt}`)
  if (payload.endedAt) lines.push(`**Ended:** ${payload.endedAt}`)
  if (payload.userContact) {
    const { name, email, phone, city } = payload.userContact
    const c: string[] = []
    if (name) c.push(`**Name:** ${name}`)
    if (email) c.push(`**Email:** ${email}`)
    if (phone) c.push(`**Phone:** ${phone}`)
    if (city) c.push(`**City:** ${city}`)
    if (c.length) {
      lines.push(`**User Contact:**`)
      lines.push(c.map((s) => `- ${s}`).join("\n"))
    }
  }

  parts.push(lines.join("\n"))

  // AI Summary (already Markdown)
  parts.push(`---\n\n${aiSummary.trim()}`)

  // Optional raw transcripts/messages in Markdown (readable, not JSON)
  const transcriptBlocks: string[] = []

  if (payload.messages?.length) {
    const m = payload.messages
      .map((x) => {
        const ts =
          x.timestamp ? ` *(at ${new Date(x.timestamp).toLocaleString()})*` : ""
        return `- **${x.role.toUpperCase()}${ts}**: ${x.content}`
      })
      .join("\n")
    transcriptBlocks.push(`### Conversation Messages\n${m}`)
  }

  if (payload.voiceTranscript) {
    transcriptBlocks.push(`### Voice Transcript\n${payload.voiceTranscript}`)
  }
  if (payload.videoTranscript) {
    transcriptBlocks.push(`### Video Transcript\n${payload.videoTranscript}`)
  }

  if (transcriptBlocks.length) {
    parts.push(`---\n\n${transcriptBlocks.join("\n\n")}`)
  }

  return parts.join("\n\n")
}

async function sendViaGmailSMTP({
  subject,
  markdown,
  replyTo,
}: {
  subject: string
  markdown: string
  replyTo?: string
}) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD not configured")
  if (!SUMMARY_TO) throw new Error("SUMMARY_TO not configured")

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
  })

  const html = renderEmailHTML(markdown)

  await transporter.sendMail({
    from: SUMMARY_FROM ? `${SUMMARY_FROM} <${GMAIL_USER}>` : GMAIL_USER,
    to: SUMMARY_TO,
    subject,
    text: markdown, // plaintext (Markdown) for deliverability
    html,           // nicely formatted HTML for clients that support it
    replyTo,
  })
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const payload: Payload = await req.json()
    const safeChannel = (payload.channel ?? "message").toLowerCase() as Payload["channel"]

    const summary = await summarizeWithOpenAI({ ...payload, channel: safeChannel })
    const subj =
      `Fix It – ${safeChannel.toUpperCase()} summary` +
      (payload.conversationId ? ` (${payload.conversationId})` : "")

    const markdownEmail = buildMarkdownEmail({
      ip,
      payload: { ...payload, channel: safeChannel },
      aiSummary: summary,
    })

    await sendViaGmailSMTP({
      subject: subj,
      markdown: markdownEmail,
      replyTo: payload.userContact?.email,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[summary-email] error", err)
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 })
  }
}
