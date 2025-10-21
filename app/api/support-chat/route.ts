import { type NextRequest, NextResponse } from "next/server"

// If you plan to run on Edge, you can uncomment next line:
// export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Parse body safely
    const body = await request.json().catch(() => ({}))
    const {
      message,
      previousResponseId,
      stream, // <- set this in your client to enable streaming
    }: {
      message?: string
      previousResponseId?: string
      stream?: boolean
    } = body

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build Create request
    const requestBody: Record<string, any> = {
      model: "gpt-4o-mini",
      input: message,
    }

    if (previousResponseId) {
      requestBody.previous_response_id = previousResponseId
    } else {
      requestBody.instructions = `You are Eve, a professional customer service representative for Fix It! Home Services, a residential contractor specializing in bathroom remodeling, plumbing, and HVAC services.

FOLLOW THIS STRUCTURED PROCESS:

1. INTRODUCTION & INFORMATION GATHERING
   - First, ask for the user's name and city/location
   - Then ask for their best phone number and email address in case they get disconnected
   - Be warm and professional in your greeting

2. NEEDS ASSESSMENT
   - Ask targeted questions to understand the client's specific needs and wants
   - Inquire about the scope of work, timeline preferences, and any specific concerns
   - Ask about budget considerations if appropriate

3. CONFIRMATION
   - Summarize what you understand about the client's needs
   - Confirm with the user that you correctly understand their requirements
   - Ask if there's anything else they'd like to add or clarify

4. PLAN OF ACTION & PRICING
   - Determine the best plan of action based on their needs
   - Provide an estimated price range for the work discussed
   - ALWAYS note: "A technician will need to assess the project in person to determine the final cost"

5. NEXT STEPS
   - Ask what the user would prefer as their next step:
     * Schedule a phone call with a team member
     * Schedule an in-person meeting/consultation with a team member
     * Explore other service options

COMPANY INFORMATION:
- Licensed, bonded, and insured (License# 948319)
- Services: Bathroom remodeling, plumbing, and HVAC
- 24/7 emergency service available
- Same-day service when possible
- Free estimates and consultations
- Email: fixithomeservices472@gmail.com
- Office Phone: 951-525-1848
- Hours: Monday-Friday 7am-5pm, Saturday 10am-2pm, Sunday Closed
- Highly rated with 4.9/5 stars from 500+ reviews

Be professional, empathetic, and thorough. Guide the conversation through each step naturally. Your response should be in markdown syntax and contain no placeholders.`
    }

    // ---- STREAMING MODE (SSE) ----
    if (stream) {
      requestBody.stream = true

      const oaiResp = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!oaiResp.ok || !oaiResp.body) {
        const text = await oaiResp.text().catch(() => "")
        return NextResponse.json(
          { error: `OpenAI request failed: ${oaiResp.status}`, details: text.slice(0, 2000) },
          { status: 502 },
        )
      }

      // Create an SSE relay stream
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      let buffered = ""
      let lastResponseId: string | null = null

      const stream = new ReadableStream({
        start(controller) {
          const push = (obj: any) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
          }

          const reader = oaiResp.body!.getReader()

          const read = async (): Promise<void> => {
            try {
              const { value, done } = await reader.read()
              if (done) {
                // flush and close
                push({ type: "done" })
                controller.close()
                return
              }

              buffered += decoder.decode(value, { stream: true })

              // Split SSE by newlines; process complete lines
              const lines = buffered.split(/\r?\n/)
              buffered = lines.pop() || "" // keep last partial

              for (const line of lines) {
                // OpenAI SSE lines usually start with "data: "
                if (!line.startsWith("data:")) continue
                const jsonStr = line.slice(5).trim()
                if (!jsonStr || jsonStr === "[DONE]") continue

                let event: any
                try {
                  event = JSON.parse(jsonStr)
                } catch {
                  // forward raw if JSON fails
                  push({ type: "raw", data: jsonStr })
                  continue
                }

                // Track response id
                if (event.type === "response.created" && event.response?.id) {
                  lastResponseId = event.response.id
                  push({ type: "response_id", id: lastResponseId })
                }

                // Stream text deltas
                if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
                  push({ type: "delta", text: event.delta })
                }

                // End of text
                if (event.type === "response.output_text.done") {
                  push({ type: "output_done" })
                }

                // Completed (final event)
                if (event.type === "response.completed") {
                  if (!lastResponseId && event.response?.id) {
                    lastResponseId = event.response.id
                    push({ type: "response_id", id: lastResponseId })
                  }
                  push({ type: "complete" })
                }

                // Error forwarding, if any
                if (event.type === "response.error") {
                  push({ type: "error", error: event.error ?? "Unknown error" })
                }
              }

              // keep reading
              read()
            } catch (err) {
              push({ type: "error", error: err instanceof Error ? err.message : String(err) })
              controller.close()
            }
          }

          read()
        },
      })

      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          // Allow CORS if needed:
          // "Access-Control-Allow-Origin": "*",
          // "Access-Control-Allow-Headers": "*",
        },
      })
    }

    // ---- NON-STREAMING MODE (JSON) ----
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const raw = await resp.text()
    if (!resp.ok) {
      return NextResponse.json(
        { error: `OpenAI request failed: ${resp.status}`, details: raw.slice(0, 2000) },
        { status: 502 },
      )
    }

    const data = JSON.parse(raw)
    const assistantResponse: string =
      data.output_text ??
      (Array.isArray(data.output)
        ? (data.output
            .filter((item: any) => item?.type === "output_text")
            .map((item: any) => item?.content?.[0]?.text)
            .filter(Boolean)
            .join("\n") ||
          data.output
            .flatMap((item: any) => item?.content ?? [])
            .find((c: any) => typeof c?.text === "string")?.text)
        : undefined) ??
      "I'm sorry, I couldn't process that request. Please try again or call us at 951-525-1848."

    return NextResponse.json({ response: assistantResponse, responseId: data.id })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process message. Please try again or contact us directly at 951-525-1848.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
