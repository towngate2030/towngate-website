"use client";

import { useEffect, useState } from "react";
import type { DocumentActionComponent } from "sanity";
import {
  openNewsletterAdminTab,
  postNewsletterSendFromStudio,
  studioAppOriginConfigured,
  studioDirectSendConfigured,
} from "./newsletterStudioSend";

export const newsletterSendAction: DocumentActionComponent = (props) => {
  const { type, draft, published, ready } = props;
  const issueId = (draft || published)?._id ?? props.id;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(false);
  }, [issueId]);

  if (type !== "newsletterIssue") return null;

  if (!studioAppOriginConfigured()) {
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
  const canDirectSend = studioDirectSendConfigured();

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
              const r = await postNewsletterSendFromStudio(issueId, alreadySent);
              window.alert(r.alertMessage);
            } finally {
              setBusy(false);
            }
          })();
          return;
        }
        openNewsletterAdminTab(issueId);
      },
      onCancel: () => {},
    },
  };
};
