/** Only `SANITY_STUDIO_*` vars are inlined into the Studio browser bundle (Sanity CLI). */
function resolveAppOrigin(): string {
  const raw = (typeof process !== "undefined" && process.env.SANITY_STUDIO_APP_ORIGIN) || "";
  return String(raw).trim().replace(/\/$/, "");
}

const APP_ORIGIN = resolveAppOrigin();
const SEND_SECRET = (process.env.SANITY_STUDIO_NEWSLETTER_SEND_SECRET || "").trim();

export function studioAppOriginConfigured(): boolean {
  return Boolean(APP_ORIGIN);
}

export function studioDirectSendConfigured(): boolean {
  return SEND_SECRET.length >= 24;
}

export function openNewsletterAdminTab(issueId: string): void {
  if (!APP_ORIGIN) return;
  const u = new URL("/tg-cp-internal/newsletter", APP_ORIGIN);
  u.searchParams.set("issue", issueId);
  window.open(u.toString(), "_blank", "noopener,noreferrer");
}

export async function postNewsletterSendFromStudio(
  issueId: string,
  forceResend: boolean,
): Promise<{ ok: boolean; alertMessage: string }> {
  if (!APP_ORIGIN) {
    return {
      ok: false,
      alertMessage:
        "Site URL not set. Add SANITY_STUDIO_APP_ORIGIN to .env (same URL as production, no trailing slash) and restart sanity dev.",
    };
  }
  if (!studioDirectSendConfigured()) {
    return { ok: false, alertMessage: "Direct send is not configured in Studio." };
  }
  const sendUrl = `${APP_ORIGIN}/api/newsletter/broadcast`;
  try {
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SEND_SECRET}`,
      },
      body: JSON.stringify({ issueId, forceResend }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const fail = Array.isArray(data.failures) ? (data.failures as string[]).join("\n") : "";
      return {
        ok: false,
        alertMessage: `Send failed: ${String(data.error || res.status)}${fail ? `\n${fail}` : ""}`,
      };
    }
    const fail = Array.isArray(data.failures) ? (data.failures as string[]).filter(Boolean) : [];
    const ids = Array.isArray(data.resendEmailIds) ? (data.resendEmailIds as string[]).filter(Boolean) : [];
    return {
      ok: true,
      alertMessage: [
        `Sent ${String(data.sent)} / ${String(data.attempted)}.`,
        fail.length ? `Some failed:\n${fail.join("\n")}` : "",
        ids.length ? `Resend IDs: ${ids.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  } catch (e) {
    return {
      ok: false,
      alertMessage: e instanceof Error ? e.message : "Network error",
    };
  }
}
