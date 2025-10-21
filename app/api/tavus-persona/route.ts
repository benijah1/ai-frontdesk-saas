import { NextResponse } from "next/server"

// const TAVUS_API_KEY = "7550c3e08a054163b4fee844e382e9e5"

const API_BASE = "https://tavusapi.com/v2"
const NAME = "Fix It Home Services Support"

// Minimal field projection to return to client
const pickPersona = (p: any) => ({
  persona_id: p?.persona_id,
  persona_name: p?.persona_name,
  created_at: p?.created_at,
})

const norm = (s: string) => String(s || "").trim().toLowerCase()

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    return res
  } finally {
    clearTimeout(t)
  }
}

export async function GET() {
  try {
    const TAVUS_API_KEY = process.env.TAVUS_API_KEY
    if (!TAVUS_API_KEY) {
      return NextResponse.json({ success: false, error: "TAVUS_API_KEY not configured" }, { status: 500 })
    }

    console.log("[v0] Ensuring Tavus persona:", NAME)

    // ---- Fast path: try to CREATE first (idempotent, avoids list round-trip) ----
    const createBody = {
      persona_name: NAME,
      pipeline_mode: "full",
      system_prompt: `You are a professional customer service representative for Fix It! Home Services, a licensed contractor specializing in bathroom remodeling, plumbing, and HVAC services.

Company Information:
- License #948319
- Phone: 951-525-1848
- Email: fixithomeservices472@gmail.com
- Hours: Monday-Friday 7am-5pm, Saturday 10am-2pm, Sunday Closed

Your process is to:
1. First ask the user's name and city/location
2. Ask for their best phone number and email in case they get disconnected
3. Ask questions to understand their specific needs and wants
4. Confirm with the user that you understand their requirements correctly
5. Determine a plan of action and provide an estimated price range (always mention that a technician will determine the final cost after inspection)
6. Determine the user's desired next steps: schedule a call with a team member, schedule an in-person meeting, or explore other options

You are friendly, professional, knowledgeable about home services, and focused on helping customers solve their problems. Always maintain a helpful and solution-oriented approach.`,
    }

    const createRes = await fetchWithTimeout(`${API_BASE}/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY,
      },
      body: JSON.stringify(createBody),
    })

    // Success → return created persona
    if (createRes.ok) {
      let created: any = {}
      try {
        created = await createRes.json()
      } catch {
        // Minimal fallback if API returns non-JSON
        created = {}
      }
      const persona = pickPersona(created?.data ?? created)
      if (!persona.persona_id) {
        throw new Error("Create succeeded but no persona_id found in response")
      }
      console.log("[v0] Persona created:", persona.persona_id)
      return NextResponse.json({ success: true, persona })
    }

    // Conflict / already exists → list and reuse
    if (createRes.status === 409 || createRes.status === 400) {
      console.log("[v0] Persona likely exists, listing to reuse…")
      const listRes = await fetchWithTimeout(`${API_BASE}/personas`, {
        method: "GET",
        headers: { "x-api-key": TAVUS_API_KEY },
      })

      if (!listRes.ok) {
        const text = await listRes.text().catch(() => "")
        return NextResponse.json(
          { success: false, error: `List personas failed: ${listRes.status}`, details: text.slice(0, 1000) },
          { status: 502 },
        )
      }

      let listJson: any = {}
      try {
        listJson = await listRes.json()
      } catch {
        listJson = {}
      }
      const data: any[] = Array.isArray(listJson?.data) ? listJson.data : []

      // Prefer exact name match; fall back to loose contains for safety
      const exact = data.find((p) => norm(p?.persona_name) === norm(NAME))
      const loose =
        exact ||
        data.find((p) => {
          const n = norm(p?.persona_name)
          return n.includes("fix it") || n.includes("home services")
        })

      if (loose) {
        const persona = pickPersona(loose)
        console.log("[v0] Using existing persona:", persona.persona_id)
        return NextResponse.json({ success: true, persona })
      }

      const conflictText = await createRes.text().catch(() => "")
      return NextResponse.json(
        {
          success: false,
          error: "Persona appears to exist but could not be found via list",
          details: conflictText.slice(0, 1000),
        },
        { status: 500 },
      )
    }

    // Other failure → bubble up details
    const errText = await createRes.text().catch(() => "")
    console.error("[v0] Create persona failed:", createRes.status, errText.slice(0, 300))
    return NextResponse.json(
      { success: false, error: `Failed to create persona (${createRes.status})`, details: errText.slice(0, 2000) },
      { status: 502 },
    )
  } catch (error) {
    console.error("[v0] Error ensuring Tavus persona:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to manage persona" },
      { status: 500 },
    )
  }
}
