import { NextResponse } from "next/server";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = String(b.email ?? "").trim().toLowerCase();
  const honeypot = String(b.website ?? "").trim();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!email || !isEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const to = process.env.CONTACT_EMAIL || "Towngate2030@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (apiKey && from) {
    const html = `<p><strong>New newsletter subscriber</strong></p><p>${escapeHtml(email)}</p>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[TownGate newsletter] ${email}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Newsletter Resend error:", await res.text());
      return NextResponse.json({ error: "Send failed" }, { status: 502 });
    }
  } else {
    console.info("[newsletter] new subscriber (no Resend):", email);
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
