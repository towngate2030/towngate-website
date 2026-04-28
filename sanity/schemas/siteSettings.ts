import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "heroBgUrl",
      title: "Hero background URL (Cloudinary)",
      type: "url",
    }),
    defineField({ name: "kickerAr", title: "Kicker (AR)", type: "string" }),
    defineField({ name: "kickerEn", title: "Kicker (EN)", type: "string" }),
    defineField({ name: "heroTitleAr", title: "Hero title (AR)", type: "string" }),
    defineField({ name: "heroTitleEn", title: "Hero title (EN)", type: "string" }),
    defineField({
      name: "heroSubtitleAr",
      title: "Hero subtitle (AR)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "heroSubtitleEn",
      title: "Hero subtitle (EN)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "valueBoxes",
      title: "Why TownGate (3 boxes)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "order", title: "Order", type: "number" }),
            defineField({ name: "titleAr", title: "Title (AR)", type: "string" }),
            defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
            defineField({ name: "bodyAr", title: "Body (AR)", type: "text", rows: 3 }),
            defineField({ name: "bodyEn", title: "Body (EN)", type: "text", rows: 3 }),
          ],
          preview: {
            select: { title: "titleEn", subtitle: "titleAr" },
          },
        },
      ],
    }),
    defineField({
      name: "whatsappContacts",
      title: "WhatsApp contacts",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "order", title: "Order", type: "number" }),
            defineField({ name: "name", title: "Sales name", type: "string" }),
            defineField({
              name: "e164",
              title: "WhatsApp E.164 digits (no +)",
              type: "string",
              description: "Example: 966593053792",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "e164" },
          },
        },
      ],
    }),
  ],
});

