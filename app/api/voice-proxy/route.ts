import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const model = searchParams.get("model") || "gpt-4o-realtime-preview-2024-10-01"

  try {
    const response = new Response(null, {
      status: 101,
      statusText: "Switching Protocols",
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
        "Sec-WebSocket-Accept": "",
      },
    })

    // In a real implementation, this would establish a WebSocket connection
    // to OpenAI's API with proper authentication and proxy messages
    // For now, return connection details for client-side handling
    return new Response(
      JSON.stringify({
        url: "wss://api.openai.com/v1/realtime",
        model: model,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] Voice proxy error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to establish voice connection",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
