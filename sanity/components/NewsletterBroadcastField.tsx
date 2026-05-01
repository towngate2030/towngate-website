"use client";

import { Box, Button, Card, Stack, Text } from "@sanity/ui";
import { useFormValue } from "sanity";
import type { StringInputProps } from "sanity";
import { useCallback, useState } from "react";
import {
  openNewsletterAdminTab,
  postNewsletterSendFromStudio,
  studioAppOriginConfigured,
  studioDirectSendConfigured,
} from "../newsletterStudioSend";

/** Renders inside the newsletter issue form (schema `components.input`). */
export function NewsletterBroadcastField(_props: StringInputProps) {
  const issueId = useFormValue(["_id"]) as string | undefined;
  const status = useFormValue(["status"]) as string | undefined;
  const alreadySent = status === "sent";
  const [busy, setBusy] = useState(false);

  const send = useCallback(
    async (force: boolean) => {
      if (!issueId) {
        window.alert("Save the document first (needs a document id).");
        return;
      }
      setBusy(true);
      try {
        const r = await postNewsletterSendFromStudio(issueId, force);
        window.alert(r.alertMessage);
      } finally {
        setBusy(false);
      }
    },
    [issueId],
  );

  const openSite = useCallback(() => {
    if (!issueId) {
      window.alert("Save the document first.");
      return;
    }
    openNewsletterAdminTab(issueId);
  }, [issueId]);

  if (!studioAppOriginConfigured()) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Stack space={3}>
          <Text weight="semibold">Send to subscribers</Text>
          <Text size={1}>
            In the project root <code>.env</code>, set <code>SANITY_STUDIO_APP_ORIGIN</code> to your live site (https,
            no trailing slash). Use the same value as <code>NEXT_PUBLIC_SITE_URL</code> if you have one. Restart{" "}
            <code>sanity dev</code>. Hosted Studio: add <code>SANITY_STUDIO_APP_ORIGIN</code> in Sanity deploy / env
            settings.
          </Text>
        </Stack>
      </Card>
    );
  }

  const direct = studioDirectSendConfigured();

  return (
    <Card padding={4} radius={2} shadow={1} tone="transparent" border>
      <Stack space={4}>
        <Box>
          <Text weight="semibold" size={2}>
            إرسال النشرة للمشتركين
          </Text>
          <Text size={1} muted>
            {direct
              ? "يرسل عبر موقع TownGate و Resend (نفس لوحة التحكم الداخلية)."
              : "يفتح صفحة الإرسال على الموقع — سجّل الدخول ثم اضغط Send to all. أو أضف SANITY_STUDIO_NEWSLETTER_SEND_SECRET ليطابق NEWSLETTER_SEND_SECRET للإرسال من هنا."}
          </Text>
        </Box>
        <Stack space={2}>
          {direct ? (
            <>
              <Button
                tone="primary"
                disabled={busy || !issueId || alreadySent}
                text={busy ? "جاري الإرسال…" : "إرسال لكل المشتركين"}
                onClick={() => void send(false)}
              />
              {alreadySent ? (
                <Button
                  tone="default"
                  disabled={busy || !issueId}
                  text={busy ? "جاري الإرسال…" : "إعادة إرسال لكل المشتركين"}
                  onClick={() => {
                    if (!window.confirm("إعادة الإرسال لجميع المشتركين النشطين؟")) return;
                    void send(true);
                  }}
                />
              ) : null}
            </>
          ) : (
            <Button tone="primary" disabled={!issueId} text="فتح صفحة الإرسال على الموقع" onClick={openSite} />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
