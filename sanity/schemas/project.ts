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

    defineField({
      name: "unitLayoutGroups",
      title: "Unit layouts (groups + items)",
      type: "array",
      of: [
        {
          type: "object",
          name: "unitLayoutGroup",
          title: "Group",
          fields: [
            defineField({
              name: "groupNameAr",
              title: "Group name (AR)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "groupNameEn",
              title: "Group name (EN)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "isActive",
              title: "Active",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "unitLayoutItem",
                  title: "Item",
                  fields: [
                    defineField({
                      name: "itemNameAr",
                      title: "Item name (AR)",
                      type: "string",
                      description:
                        "Example: تايب B - أرضي - مساحة 170 م² (include area/description in the name)",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "itemNameEn",
                      title: "Item name (EN)",
                      type: "string",
                      description:
                        "Example: Type B - Ground - Area 170 m² (include area/description in the name)",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "image",
                      title: "Layout image URL",
                      type: "url",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "optionalPdf",
                      title: "Optional PDF URL",
                      type: "url",
                    }),
                    defineField({
                      name: "order",
                      title: "Order",
                      type: "number",
                      initialValue: 0,
                    }),
                    defineField({
                      name: "isActive",
                      title: "Active",
                      type: "boolean",
                      initialValue: true,
                    }),
                  ],
                  preview: {
                    select: { title: "itemNameEn", subtitle: "image" },
                    prepare({ title, subtitle }) {
                      return { title: title || "Item", subtitle: subtitle || "" };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "groupNameEn", subtitle: "isActive" },
            prepare({ title, subtitle }) {
              return {
                title: title || "Group",
                subtitle: subtitle ? "Active" : "Inactive",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "titleEn",
      subtitle: "locationEn",
    },
  },
});

