"use client";

import type { DocumentActionComponent } from "sanity";

const APP_ORIGIN = String(process.env.SANITY_STUDIO_APP_ORIGIN || "").trim().replace(/\/$/, "");
const BEARER = String(process.env.SANITY_STUDIO_NEWSLETTER_SEND_SECRET || "").trim();

export const newsletterBroadcastAction: DocumentActionComponent = (props) => {
  if (props.type !== "newsletterIssue") return null;

  const issueId = (props.draft || props.published)?._id ?? props.id;
  const status = (props.draft || props.published) as { sendStatus?: string; status?: string } | null;
  const alreadySent = status?.sendStatus === "sent" || status?.status === "sent";

  const canDirectSend = APP_ORIGIN && BEARER.length >= 24;

  return {
    label: "Send to subscribers",
    tone: "positive",
    disabled: !props.ready || !issueId,
    title: canDirectSend
      ? "Send this issue to all verified subscribers."
      : "Configure SANITY_STUDIO_APP_ORIGIN and SANITY_STUDIO_NEWSLETTER_SEND_SECRET, or send from /tg-cp-internal/newsletter.",
    dialog: {
      type: "confirm",
      tone: alreadySent ? "caution" : "positive",
      message: canDirectSend
        ? alreadySent
          ? "This issue was already sent. Resend to all verified subscribers?"
          : "Send this issue to all verified subscribers now?"
        : "Open the TownGate send page in a new tab? You must be logged in to the control panel.",
      confirmButtonText: canDirectSend ? (alreadySent ? "Resend" : "Send") : "Open tab",
      onConfirm: () => {
        if (!issueId) return;

        if (!APP_ORIGIN) {
          window.alert("Missing SANITY_STUDIO_APP_ORIGIN in Studio env.");
          return;
        }

        if (!canDirectSend) {
          const u = new URL("/tg-cp-internal/newsletter", APP_ORIGIN);
          u.searchParams.set("issue", issueId);
          window.open(u.toString(), "_blank", "noopener,noreferrer");
          return;
        }

        void (async () => {
          try {
            const res = await fetch(`${APP_ORIGIN}/api/newsletter/broadcast`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${BEARER}`,
              },
              body: JSON.stringify({ issueId, forceResend: alreadySent }),
            });
            const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
            if (!res.ok) {
              const fail = Array.isArray(data.failures) ? (data.failures as string[]).join("\n") : "";
              window.alert(`Send failed: ${String(data.error || res.status)}${fail ? `\n${fail}` : ""}`);
              return;
            }
            const fail = Array.isArray(data.failures) ? (data.failures as string[]).filter(Boolean) : [];
            const ids = Array.isArray(data.resendEmailIds) ? (data.resendEmailIds as string[]).filter(Boolean) : [];
            window.alert(
              [
                `Sent ${String(data.sent)} / ${String(data.attempted)}.`,
                fail.length ? `Some failed:\n${fail.join("\n")}` : "",
                ids.length ? `Resend IDs: ${ids.join(", ")}` : "",
              ]
                .filter(Boolean)
                .join("\n"),
            );
          } catch (e) {
            window.alert(e instanceof Error ? e.message : "Network error");
          }
        })();
      },
      onCancel: () => {},
    },
  };
};

