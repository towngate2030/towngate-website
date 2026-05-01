"use client";

import { useEffect, useState } from "react";
import type { DocumentActionComponent } from "sanity";

const APP_ORIGIN = (process.env.SANITY_STUDIO_APP_ORIGIN || "").replace(/\/$/, "");
const SEND_SECRET = (process.env.SANITY_STUDIO_NEWSLETTER_SEND_SECRET || "").trim();

export const newsletterSendAction: DocumentActionComponent = (props) => {
  const { type, draft, published, ready } = props;
  const issueId = (draft || published)?._id ?? props.id;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(false);
  }, [issueId]);

  if (type !== "newsletterIssue") return null;

  if (!APP_ORIGIN) {
    return {
      label: "Send to all",
      disabled: true,
      title:
        "Set SANITY_STUDIO_APP_ORIGIN in your Studio env (e.g. https://your-site.com), then restart sanity dev.",
    };
  }

  const doc = draft || published;
  const status = (doc as { status?: string } | null)?.status;
  const alreadySent = status === "sent";
  const sendUrl = `${APP_ORIGIN}/api/newsletter/send`;
  const canDirectSend = SEND_SECRET.length >= 24;

  return {
    label: busy ? "Sending…" : "Send to all",
    disabled: !ready || !issueId || busy,
    tone: "positive",
    title: canDirectSend
      ? "Send this issue to all active subscribers via Resend."
      : "Opens the TownGate send page (log in there). Set SANITY_STUDIO_NEWSLETTER_SEND_SECRET equal to server NEWSLETTER_SEND_SECRET to send from Studio without leaving.",
    dialog: {
      type: "confirm",
      tone: alreadySent ? "caution" : "positive",
      message: canDirectSend
        ? alreadySent
          ? "This issue is already marked sent. Force resend to all active subscribers?"
          : "Send this newsletter issue to all active subscribers now?"
        : alreadySent
          ? "Open TownGate in a new tab to resend? You must be logged in to the control panel."
          : "Open the TownGate newsletter send page in a new tab? Log in, then use Send to all for this issue.",
      confirmButtonText: canDirectSend ? (alreadySent ? "Force resend" : "Send now") : "Open tab",
      onConfirm: () => {
        if (!issueId) return;
        if (canDirectSend) {
          void (async () => {
            setBusy(true);
            try {
              const res = await fetch(sendUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${SEND_SECRET}`,
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
              const ids = Array.isArray(data.resendEmailIds)
                ? (data.resendEmailIds as string[]).filter(Boolean)
                : [];
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
            } finally {
              setBusy(false);
            }
          })();
          return;
        }
        const u = new URL("/tg-cp-internal/newsletter", APP_ORIGIN);
        u.searchParams.set("issue", issueId);
        window.open(u.toString(), "_blank", "noopener,noreferrer");
      },
      onCancel: () => {},
    },
  };
};
