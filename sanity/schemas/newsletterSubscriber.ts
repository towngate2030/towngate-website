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
      name: "subscribedAt",
      title: "Subscribed at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "active",
      title: "Active (receives mail)",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      initialValue: "website_footer",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "subscribedAt" },
  },
});
