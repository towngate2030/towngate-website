import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminSession";
import { authorizeNewsletterSend } from "@/lib/newsletterSendAuth";
import { getSanityWriteClient } from "@/lib/sanityWrite";

const SEND_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: SEND_CORS_HEADERS });
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

function buildNewsletterHtml(issue: IssueDoc) {
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
          You are receiving this email because you subscribed to TownGate updates on our website.
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: SEND_CORS_HEADERS });
  }

  const write = getSanityWriteClient();
  if (!write) {
    return NextResponse.json(
      { error: "Sanity write token not configured (set SANITY_API_WRITE_TOKEN)" },
      { status: 503, headers: SEND_CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: SEND_CORS_HEADERS });
  }

  const b = body as Record<string, unknown>;
  const issueId = String(b.issueId ?? "").trim();
  const forceResend = Boolean(b.forceResend);

  if (!issueId) {
    return NextResponse.json({ error: "issueId required" }, { status: 400, headers: SEND_CORS_HEADERS });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "Resend not configured (set RESEND_API_KEY and RESEND_FROM)" },
      { status: 500, headers: SEND_CORS_HEADERS },
    );
  }

  const issue = await write.fetch<IssueDoc | null>(
    `*[_type=="newsletterIssue" && _id==$id][0]{
      _id,title,subjectLine,preheader,imageUrls,bodyText,ctaLabel,ctaUrl,status
    }`,
    { id: issueId },
  );

  if (!issue?._id) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404, headers: SEND_CORS_HEADERS });
  }

  if (issue.status === "sent" && !forceResend) {
    return NextResponse.json(
      { error: "Already sent (pass forceResend to resend)" },
      { status: 409, headers: SEND_CORS_HEADERS },
    );
  }

  const rows = await write.fetch<Array<{ email?: string | null }>>(
    `*[_type=="newsletterSubscriber" && active != false && defined(email)]{email}`,
  );

  const unique = Array.from(
    new Set(
      (rows || [])
        .map((r) => String(r?.email || "").trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
    ),
  );
  if (!unique.length) {
    return NextResponse.json({ error: "No active subscribers" }, { status: 400, headers: SEND_CORS_HEADERS });
  }

  const html = buildNewsletterHtml(issue);
  const subject = String(issue.subjectLine || "TownGate newsletter");

  let sent = 0;
  const failures: string[] = [];

  const resendIds: string[] = [];

  for (const to of unique) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      failures.push(`${to}: ${raw.slice(0, 240)}`);
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

  if (!sent) {
    return NextResponse.json(
      { error: "All sends failed", failures: failures.slice(0, 10) },
      { status: 502, headers: SEND_CORS_HEADERS },
    );
  }

  const now = new Date().toISOString();
  await write
    .patch(issue._id)
    .set({
      status: "sent",
      sentAt: now,
      recipientCount: sent,
    })
    .commit();

  return NextResponse.json(
    {
      ok: true,
      sent,
      attempted: unique.length,
      failures: failures.slice(0, 20),
      resendEmailIds: resendIds.slice(0, 10),
    },
    { headers: SEND_CORS_HEADERS },
  );
}
