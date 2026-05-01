import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { addHoursIso, normalizeEmail, randomToken, sha256Base64Url } from "@/lib/newsletter";

const VERIFY_TOKEN_HOURS = 24;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = normalizeEmail(b.email);
  const honeypot = String(b.website ?? "").trim();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!email) {
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

  const existing = await write.fetch<
    | null
    | {
        _id: string;
        status?: "pending" | "verified" | "unsubscribed" | null;
      }
  >(`*[_type=="newsletterSubscriber" && email==$email][0]{_id,status}`, { email });

  const now = new Date().toISOString();

  try {
    if (existing?._id && existing.status === "verified") {
      return NextResponse.json({ ok: true, message: "already_subscribed" });
    }

    const token = randomToken(32);
    const tokenHash = sha256Base64Url(token);
    const unsubToken = randomToken(24);
    const expiresAt = addHoursIso(VERIFY_TOKEN_HOURS);

    if (existing?._id) {
      await write
        .patch(existing._id)
        .set({
          status: "pending",
          subscribedAt: now,
          verificationTokenHash: tokenHash,
          verificationTokenExpiresAt: expiresAt,
          unsubscribeToken: unsubToken,
        })
        .unset(["unsubscribedAt", "verifiedAt"])
        .commit();
    } else {
      await write.create({
        _type: "newsletterSubscriber",
        email,
        status: "pending",
        subscribedAt: now,
        verificationTokenHash: tokenHash,
        verificationTokenExpiresAt: expiresAt,
        unsubscribeToken: unsubToken,
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!apiKey || !from || !siteUrl) {
      return NextResponse.json(
        { ok: true, message: "pending_verification" },
        { status: 202 },
      );
    }

    const verifyUrl = new URL("/api/newsletter/verify", siteUrl);
    verifyUrl.searchParams.set("token", token);

    const html = `
      <p>Please confirm your email subscription to TownGate updates:</p>
      <p><a href="${verifyUrl.toString()}">Confirm subscription</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirm your TownGate subscription",
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[newsletter] Resend verify failed:", err);
      return NextResponse.json({ ok: true, message: "pending_verification" }, { status: 202 });
    }
  } catch (e) {
    console.error("[newsletter] Sanity write failed:", e);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: "verification_sent" });
}
