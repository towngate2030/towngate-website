import { defineField, defineType } from "sanity";

export const newsletterIssue = defineType({
  name: "newsletterIssue",
  title: "Newsletter issues",
  type: "document",
  fields: [
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
      name: "sentAt",
      title: "Sent at",
      type: "datetime",
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
