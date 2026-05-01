import { defineField, defineType } from "sanity";
import { NewsletterBroadcastField } from "../components/NewsletterBroadcastField";

export const newsletterIssue = defineType({
  name: "newsletterIssue",
  title: "Newsletter issues",
  type: "document",
  fields: [
    defineField({
      name: "sendBroadcastPanel",
      title: "Broadcast",
      type: "string",
      description: "UI only — not used in the email.",
      readOnly: true,
      components: { input: NewsletterBroadcastField },
    }),
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "For your reference in the list (not shown in the email).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subjectLine",
      title: "Email subject",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "preheader",
      title: "Preheader (optional)",
      type: "string",
      description: "Short preview text some clients show next to the subject.",
    }),
    defineField({
      name: "imageUrls",
      title: "Image URLs (Cloudinary)",
      type: "array",
      of: [{ type: "url" }],
      validation: (r) => r.max(10),
    }),
    defineField({
      name: "bodyText",
      title: "Email body (plain text)",
      type: "text",
      rows: 14,
      description: "Plain text only. Line breaks are kept. For styling, use images above.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button label (optional)",
      type: "string",
    }),
    defineField({
      name: "ctaUrl",
      title: "Button URL (optional)",
      type: "url",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Sent", value: "sent" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sendStatus",
      title: "Send status",
      type: "string",
      readOnly: true,
      options: {
        list: [
          { title: "Not sent", value: "not_sent" },
          { title: "Sending", value: "sending" },
          { title: "Sent", value: "sent" },
          { title: "Failed", value: "failed" },
        ],
      },
    }),
    defineField({
      name: "sentAt",
      title: "Sent at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "sentBy",
      title: "Sent by",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "sentCount",
      title: "Sent count",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "failedCount",
      title: "Failed count",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "recipientCount",
      title: "Recipients (last send)",
      type: "number",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status" },
  },
});
