import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json(); // { email, trade, source, page, ts }
    // TODO: validate payload
    // TODO: forward to CRM or save to DB
    // Example: await fetch(process.env.CRM_WEBHOOK_URL!, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Bad Request" }, { status: 400 });
  }
}
