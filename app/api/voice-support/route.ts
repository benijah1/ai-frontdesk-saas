// app/api/realtime/session/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge"; // Edge works well for low-latency

export async function GET() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  // Create an ephemeral Realtime session (token) for the browser
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "realtime=v1",
    },
    body: JSON.stringify({
      model: "gpt-realtime",               // GA realtime model
      voice: "alloy",
      modalities: ["text", "audio"],
      instructions: `You are Eve, a helpful customer service representative for Fix It! Home Services.

1) Ask for name + city
2) Ask for best phone + email
3) Ask diagnostic questions about bathroom/plumbing/HVAC needs
4) Confirm understanding
5) Give an estimated price range (final cost by technician)
6) Offer next steps: schedule call, schedule meeting, or explore options

Company: License #948319, fixithomeservices472@gmail.com, (951) 525-1848
Hours: Mon–Fri 7am–5pm, Sat 10am–2pm, Sun Closed
Keep responses natural, friendly, under 100 words, and do not use any placeholder copy/words.`,
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      input_audio_transcription: { model: "gpt-4o-transcribe" }, // speech->text in session
      temperature: 0.8,
      // max_output_tokens: 2048, // (optional) current name in docs
    }),
  });

  const json = await r.json();
  if (!r.ok) {
    const msg = json?.error?.message || "Failed to create Realtime session";
    return NextResponse.json({ error: msg }, { status: r.status });
  }

  // json includes `client_secret: { value, expires_at }` and session info
  return NextResponse.json({
    clientSecret: json.client_secret?.value,
    expiresAt: json.client_secret?.expires_at,
    session: json, // (optional) useful for debugging
  });
}
