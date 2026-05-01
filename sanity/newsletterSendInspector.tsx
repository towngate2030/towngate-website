"use client";

import { EnvelopeIcon } from "@sanity/icons";
import { Box, Button, Card, Stack, Text } from "@sanity/ui";
import { defineDocumentInspector } from "sanity";
import type { DocumentInspectorProps } from "sanity";
import { useCallback, useState } from "react";
import {
  openNewsletterAdminTab,
  postNewsletterSendFromStudio,
  studioAppOriginConfigured,
  studioDirectSendConfigured,
} from "./newsletterStudioSend";

function NewsletterSendInspectorPanel(props: DocumentInspectorProps) {
  const { documentId } = props;
  const [busy, setBusy] = useState(false);

  const openSite = useCallback(() => {
    openNewsletterAdminTab(documentId);
  }, [documentId]);

  const send = useCallback(
    async (forceResend: boolean) => {
      setBusy(true);
      try {
        const r = await postNewsletterSendFromStudio(documentId, forceResend);
        window.alert(r.alertMessage);
      } finally {
        setBusy(false);
      }
    },
    [documentId],
  );

  if (!studioAppOriginConfigured()) {
    return (
      <Box padding={4}>
        <Stack space={3}>
          <Text weight="semibold">Newsletter — Send to all</Text>
          <Text size={1}>
            Add <code>SANITY_STUDIO_APP_ORIGIN</code> (your live site, no trailing slash) to the Studio env file,
            then restart <code>sanity dev</code> or redeploy the hosted Studio.
          </Text>
        </Stack>
      </Box>
    );
  }

  const direct = studioDirectSendConfigured();

  return (
    <Box padding={3}>
      <Stack space={4}>
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={3}>
            <Text weight="semibold">Send to subscribers</Text>
            <Text size={1} muted>
              {direct
                ? "Uses your production API and Resend (same as /tg-cp-internal/newsletter)."
                : "Opens TownGate in a new tab. Sign in to the control panel, then press Send to all. Optional: set SANITY_STUDIO_NEWSLETTER_SEND_SECRET equal to server NEWSLETTER_SEND_SECRET to send from here."}
            </Text>
            {direct ? (
              <Stack space={2}>
                <Button
                  tone="primary"
                  disabled={busy}
                  text={busy ? "Sending…" : "Send to all"}
                  onClick={() => void send(false)}
                />
                <Button
                  tone="default"
                  mode="ghost"
                  disabled={busy}
                  text="Force resend (all subscribers)"
                  onClick={() => {
                    if (!window.confirm("Resend this issue to all active subscribers?")) return;
                    void send(true);
                  }}
                />
              </Stack>
            ) : (
              <Button tone="primary" text="Open send page (TownGate)" onClick={openSite} />
            )}
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

/** Visible tab + toolbar button on newsletter issue documents (easier than footer-only document actions). */
export const newsletterSendInspector = defineDocumentInspector({
  name: "newsletter-send",
  useMenuItem: ({ documentType }) => ({
    title: "Send email",
    icon: EnvelopeIcon,
    showAsAction: true,
    hidden: documentType !== "newsletterIssue",
    tone: "primary",
  }),
  component: NewsletterSendInspectorPanel,
});
