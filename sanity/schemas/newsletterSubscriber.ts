import { defineField, defineType } from "sanity";

export const newsletterSubscriber = defineType({
  name: "newsletterSubscriber",
  title: "Newsletter subscribers",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) =>
        r.required().custom((v) => {
          const s = String(v || "").trim().toLowerCase();
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || "Invalid email";
        }),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Verified", value: "verified" },
          { title: "Unsubscribed", value: "unsubscribed" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subscribedAt",
      title: "Subscribed at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "verifiedAt",
      title: "Verified at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "unsubscribedAt",
      title: "Unsubscribed at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "verificationTokenHash",
      title: "Verification token (hash)",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "verificationTokenExpiresAt",
      title: "Verification token expires",
      type: "datetime",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "unsubscribeToken",
      title: "Unsubscribe token",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "status" },
  },
});
