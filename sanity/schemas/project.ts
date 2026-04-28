import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleEn", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["available", "sold"] },
      initialValue: "available",
    }),

    defineField({ name: "titleAr", title: "Title (AR)", type: "string" }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
    defineField({ name: "excerptAr", title: "Excerpt (AR)", type: "text", rows: 2 }),
    defineField({ name: "excerptEn", title: "Excerpt (EN)", type: "text", rows: 2 }),
    defineField({ name: "locationAr", title: "Location (AR)", type: "string" }),
    defineField({ name: "locationEn", title: "Location (EN)", type: "string" }),

    defineField({
      name: "bodyAr",
      title: "Body (AR) – rich text",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "bodyEn",
      title: "Body (EN) – rich text",
      type: "array",
      of: [{ type: "block" }],
    }),

    defineField({
      name: "imageUrls",
      title: "Image URLs (Cloudinary) – up to 10",
      type: "array",
      of: [{ type: "url" }],
      validation: (r) => r.max(10),
    }),
    defineField({
      name: "videoUrls",
      title: "Video URLs (Cloudinary) – up to 2",
      type: "array",
      of: [{ type: "url" }],
      validation: (r) => r.max(2),
    }),
  ],
  preview: {
    select: {
      title: "titleEn",
      subtitle: "locationEn",
    },
  },
});

