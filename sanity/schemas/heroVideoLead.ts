import { defineField, defineType } from "sanity";

/**
 * Homepage hero: اسم المشروع + فيديو الخلفية + نموذج تسجيل اهتمام (البيانات تُحفظ كـ Lead في Sanity).
 */
export const heroVideoLead = defineType({
  name: "heroVideoLead",
  title: "الهيرو — فيديو + تسجيل اهتمام",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "تفعيل هذا الهيرو على الصفحة الرئيسية",
      type: "boolean",
      description:
        "لو متفعّل، يظهر الفيديو ونموذج تسجيل الاهتمام بدل الهيرو العادي. لو متوقّف يظهر الهيرو الافتراضي.",
      initialValue: false,
    }),
    defineField({
      name: "projectNameAr",
      title: "اسم المشروع (عربي)",
      type: "string",
      validation: (r) => r.max(120),
    }),
    defineField({
      name: "projectNameEn",
      title: "اسم المشروع (إنجليزي)",
      type: "string",
      validation: (r) => r.max(120),
    }),
    defineField({
      name: "backgroundVideo",
      title: "رفع الفيديو (خلفية الصفحة)",
      type: "file",
      description: "ارفع ملف فيديو من الجهاز (يفضّل MP4 بحجم معقول للموبايل).",
      options: {
        accept: "video/*",
      },
    }),
    defineField({
      name: "backgroundVideoUrl",
      title: "أو رابط فيديو جاهز (اختياري)",
      type: "url",
      description:
        "لو الفيديو كبير أو مستضاف خارج Sanity، الصق رابط HTTPS مباشر لملف الفيديو. يُستخدم إذا لم يُرفع ملف أعلاه.",
      validation: (r) =>
        r.custom((u) => {
          if (u == null || u === "") return true;
          return String(u).startsWith("https://") ? true : "يجب أن يبدأ الرابط بـ https";
        }),
    }),
    defineField({
      name: "posterImage",
      title: "صورة بديلة قبل تحميل الفيديو (اختياري)",
      type: "image",
      description: "تظهر لحظات قبل تشغيل الفيديو وتُستخدم كـ poster.",
      options: { hotspot: true },
    }),
    defineField({
      name: "videoMuted",
      title: "الفيديو بدون صوت (ميوت)",
      type: "boolean",
      description:
        "مُفعّل افتراضيًا: الفيديو يشتغل صامت (مناسب للخلفية). عطّله لو أردت محاولة تشغيل الصوت — المتصفحات قد تمنع الصوت التلقائي.",
      initialValue: true,
    }),
    defineField({
      name: "saveLeadsToSanity",
      title: "حفظ طلبات التسجيل في Sanity",
      type: "boolean",
      description: "مثل النشرة: كل إرسال يُنشئ مستند Lead (يلزم توكن الكتابة على السيرفر).",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      ar: "projectNameAr",
      en: "projectNameEn",
      active: "isActive",
    },
    prepare({ ar, en, active }) {
      const title = [ar, en].filter(Boolean).join(" / ") || "Hero video + lead";
      return {
        title,
        subtitle: active ? "مفعّل" : "متوقف",
      };
    },
  },
});
