import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminSession";
import { authorizeNewsletterSend } from "@/lib/newsletterSendAuth";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { randomToken } from "@/lib/newsletter";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

type IssueDoc = {
  _id: string;
  title?: string;
  subjectLine?: string;
  preheader?: string;
  imageUrls?: string[];
  bodyText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status?: string;
  sendStatus?: "not_sent" | "sending" | "sent" | "failed";
  sentAt?: string;
};

function isHttpUrl(s: string) {
  const v = String(s || "").trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function buildNewsletterHtml(issue: IssueDoc, unsubscribeUrl: string) {
  const imgs = (issue.imageUrls || [])
    .filter((u) => isHttpUrl(u))
    .map(
      (u) =>
        `<p style="margin:16px 0"><img src="${escapeAttr(u)}" alt="" width="560" style="max-width:100%;height:auto;border-radius:12px;display:block" /></p>`,
    )
    .join("");

  const body = escapeHtml(String(issue.bodyText || "")).replace(/\n/g, "<br/>");

  const cta =
    issue.ctaUrl && isHttpUrl(issue.ctaUrl) && issue.ctaLabel
      ? `<p style="margin:24px 0;text-align:center">
          <a href="${escapeAttr(issue.ctaUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#ff6600;color:#ffffff;font-weight:800;text-decoration:none">
            ${escapeHtml(issue.ctaLabel)}
          </a>
        </p>`
      : "";

  const pre = issue.preheader
    ? `<span style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
        ${escapeHtml(issue.preheader)}
      </span>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f6f6">
${pre}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#002b49">
      <tr><td>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6">${body}</p>
        ${imgs}
        ${cta}
        <p style="margin:24px 0 0;font-size:11px;line-height:1.5;color:#6b7280">
          You are receiving this email because you subscribed to TownGate updates on our website.<br/>
          <a href="${escapeAttr(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(req: Request) {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  if (!authorizeNewsletterSend(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
  }

  const write = getSanityWriteClient();
  if (!write) {
    return NextResponse.json(
      { error: "Sanity write token not configured (set SANITY_API_WRITE_TOKEN)" },
      { status: 503, headers: CORS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }
  const b = body as Record<string, unknown>;
  const issueId = String(b.issueId ?? "").trim();
  const forceResend = Boolean(b.forceResend);
  if (!issueId) return NextResponse.json({ error: "issueId required" }, { status: 400, headers: CORS });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!apiKey || !from || !siteUrl) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY / RESEND_FROM / NEXT_PUBLIC_SITE_URL" },
      { status: 500, headers: CORS },
    );
  }

  const issue = await write.fetch<IssueDoc | null>(
    `*[_type=="newsletterIssue" && _id==$id][0]{
      _id,title,subjectLine,preheader,imageUrls,bodyText,ctaLabel,ctaUrl,sendStatus,sentAt
    }`,
    { id: issueId },
  );
  if (!issue?._id) return NextResponse.json({ error: "Issue not found" }, { status: 404, headers: CORS });

  if (issue.sendStatus === "sent" && !forceResend) {
    return NextResponse.json({ error: "Already sent (pass forceResend to resend)" }, { status: 409, headers: CORS });
  }

  // mark sending
  await write.patch(issue._id).set({ sendStatus: "sending" }).commit();

  // Back-compat: treat legacy `active: true` with missing status as verified for now.
  const rows = await write.fetch<Array<{ _id: string; email?: string | null; unsubscribeToken?: string | null }>>(
    `*[_type=="newsletterSubscriber" &&
        (
          status=="verified" ||
          (!defined(status) && active == true)
        ) &&
        defined(email)
      ]{_id,email,unsubscribeToken}`,
  );

  const recipients = (rows || [])
    .map((r) => ({
      id: String(r._id),
      email: String(r.email || "").trim().toLowerCase(),
      unsubToken: r.unsubscribeToken ? String(r.unsubscribeToken) : null,
    }))
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

  if (!recipients.length) {
    await write.patch(issue._id).set({ sendStatus: "failed", failedCount: 0, sentCount: 0 }).commit();
    return NextResponse.json({ error: "No verified subscribers" }, { status: 400, headers: CORS });
  }

  let sent = 0;
  const failures: string[] = [];
  const resendIds: string[] = [];

  for (const r of recipients) {
    // Ensure an unsubscribe token exists (stored as hidden field in Sanity)
    const unsubToken = r.unsubToken || randomToken(24);
    if (!r.unsubToken) {
      try {
        await write.patch(r.id).set({ unsubscribeToken: unsubToken }).commit();
        r.unsubToken = unsubToken;
      } catch {
        // ignore
      }
    }

    const unsubUrl = new URL("/api/newsletter/unsubscribe", siteUrl);
    unsubUrl.searchParams.set("token", unsubToken);

    const html = buildNewsletterHtml(issue, unsubUrl.toString());
    const subject = String(issue.subjectLine || "TownGate newsletter");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [r.email],
        subject,
        html,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      failures.push(`${r.email}: ${raw.slice(0, 240)}`);
      continue;
    }
    try {
      const j = JSON.parse(raw) as { id?: string };
      if (j?.id) resendIds.push(j.id);
    } catch {
      // ignore
    }
    sent += 1;
  }

  const failedCount = recipients.length - sent;
  const now = new Date().toISOString();

  await write
    .patch(issue._id)
    .set({
      sendStatus: sent ? "sent" : "failed",
      sentAt: sent ? now : issue.sentAt,
      sentCount: sent,
      failedCount,
      recipientCount: sent,
      status: sent ? "sent" : issue.status,
    })
    .commit();

  if (!sent) {
    return NextResponse.json(
      { error: "All sends failed", failures: failures.slice(0, 10) },
      { status: 502, headers: CORS },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      sent,
      attempted: recipients.length,
      failures: failures.slice(0, 20),
      resendEmailIds: resendIds.slice(0, 10),
    },
    { headers: CORS },
  );
}

