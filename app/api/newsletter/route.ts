import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { addHoursIso, normalizeEmail, randomToken, sha256Base64Url } from "@/lib/newsletter";
import { buildNewsletterVerifyLink, getCanonicalSiteOrigin } from "@/lib/siteUrl";

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
    const fromRaw = process.env.RESEND_FROM?.trim();
    const siteOrigin = getCanonicalSiteOrigin();
    if (!apiKey || !fromRaw || !siteOrigin) {
      return NextResponse.json(
        { ok: true, message: "pending_verification" },
        { status: 202 },
      );
    }

    const verifyUrl = buildNewsletterVerifyLink(token);
    if (!verifyUrl) {
      return NextResponse.json(
        { ok: true, message: "pending_verification" },
        { status: 202 },
      );
    }

    /** HTML attribute escape for URLs in href/display. */
    const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const hrefEsc = escAttr(verifyUrl);
    const html = `
<!DOCTYPE html>
<html><body style="font-family:system-ui,Segoe UI,sans-serif;line-height:1.5;color:#111;">
  <p>Hi,</p>
  <p>Thanks for joining the TownGate newsletter. We send occasional updates about new projects,
  announcements, and what we&apos;re building in Egypt.</p>
  <p>Please confirm your email so we know it&apos;s really you. This link stays active for ${VERIFY_TOKEN_HOURS} hours:</p>
  <p style="margin:28px 0;">
    <a href="${hrefEsc}"
       style="background:#ff6600;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">
      Confirm Subscription
    </a>
  </p>
  <p>If the button does not work in your inbox, copy and paste this address into your browser:</p>
  <p style="word-break:break-all;"><a href="${hrefEsc}">${hrefEsc}</a></p>
  <p>If you did not subscribe, you can ignore this message—you won&apos;t be added.</p>
  <p style="margin-top:32px;color:#555;font-size:14px;">— TownGate</p>
</body></html>
`;

    const textBody = [
      "Hi,",
      "",
      `Thanks for joining the TownGate newsletter. Confirm your subscription by opening this link (valid ${VERIFY_TOKEN_HOURS} hours):`,
      "",
      verifyUrl,
      "",
      "If you did not subscribe, ignore this email.",
      "",
      "— TownGate",
    ].join("\n");

    const fromHeader =
      fromRaw.includes("<") && fromRaw.includes(">")
        ? fromRaw
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromRaw)
          ? `TownGate <${fromRaw}>`
          : fromRaw;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromHeader,
        to: [email],
        subject: "Confirm your TownGate subscription",
        html,
        text: textBody,
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
