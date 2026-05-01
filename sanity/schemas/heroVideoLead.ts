import { defineField, defineType } from "sanity";

/**
 * Homepage hero with background video + lead form (singleton in practice: keep one document).
 */
export const heroVideoLead = defineType({
  name: "heroVideoLead",
  title: "Hero video + lead (homepage)",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "When off, the standard homepage hero is shown instead.",
      initialValue: false,
    }),
    defineField({
      name: "backgroundVideoUrl",
      title: "Background video URL",
      type: "url",
      description: "Direct HTTPS URL to an MP4/WebM (or compatible) file.",
      validation: (r) =>
        r.custom((u) => {
          if (u == null || u === "") return true;
          const s = String(u);
          return s.startsWith("https://") ? true : "Must use https";
        }),
    }),
    defineField({
      name: "posterImage",
      title: "Poster image",
      type: "image",
      description: "Shown before the video loads and as video poster.",
      options: { hotspot: true },
    }),
    defineField({ name: "titleAr", title: "Title (AR)", type: "string" }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
    defineField({ name: "subtitleAr", title: "Subtitle (AR)", type: "text", rows: 3 }),
    defineField({ name: "subtitleEn", title: "Subtitle (EN)", type: "text", rows: 3 }),
    defineField({ name: "formTitleAr", title: "Form title (AR)", type: "string" }),
    defineField({ name: "formTitleEn", title: "Form title (EN)", type: "string" }),
    defineField({ name: "buttonTextAr", title: "Submit button (AR)", type: "string" }),
    defineField({ name: "buttonTextEn", title: "Submit button (EN)", type: "string" }),
    defineField({
      name: "formPosition",
      title: "Form position (desktop)",
      type: "string",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "center",
    }),
    defineField({
      name: "overlayOpacity",
      title: "Dark overlay opacity",
      type: "number",
      description: "0 = transparent, 1 = solid black (typical 0.35–0.65).",
      validation: (r) => r.min(0).max(1),
      initialValue: 0.5,
    }),
    defineField({
      name: "saveLeadsToSanity",
      title: "Save leads to Sanity",
      type: "boolean",
      description: "When enabled, submissions create Lead documents (requires API write token).",
      initialValue: true,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Hero video + lead" };
    },
  },
});
