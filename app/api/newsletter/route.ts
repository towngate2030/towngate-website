import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";

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

  const write = getSanityWriteClient();
  if (!write) {
    return NextResponse.json(
      {
        error:
          "Newsletter storage is not configured (set SANITY_API_WRITE_TOKEN with Editor access on Vercel).",
      },
      { status: 503 },
    );
  }

  const existingId = await write.fetch<string | null>(
    `*[_type == "newsletterSubscriber" && email == $email][0]._id`,
    { email },
  );

  const now = new Date().toISOString();

  try {
    if (existingId) {
      await write
        .patch(existingId)
        .set({
          active: true,
          subscribedAt: now,
          source: "website_footer",
        })
        .commit();
    } else {
      await write.create({
        _type: "newsletterSubscriber",
        email,
        subscribedAt: now,
        active: true,
        source: "website_footer",
      });
    }
  } catch (e) {
    console.error("[newsletter] Sanity write failed:", e);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
