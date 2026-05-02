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
      name: "taglineAr",
      title: "الجملة تحت العنوان وفوق نموذج التسجيل (عربي)",
      type: "text",
      rows: 3,
      description:
        "هذا هو النص الصغير بين عنوان المشروع وصندوق «سجل اهتمامك» (مثل: «يلتقي أفضل ما في العالم…»). اكتبه هنا بالكامل من Sanity. لو تركت الحقل فارغًا يُعرض نص احتياطي من ملفات الترجمة في الكود.",
    }),
    defineField({
      name: "taglineEn",
      title: "الجملة تحت العنوان وفوق نموذج التسجيل (إنجليزي)",
      type: "text",
      rows: 3,
      description:
        "Same strapline above the lead form (English). Leave empty to use the English fallback from site translations.",
    }),
    defineField({
      name: "leadUnitTypes",
      title: "خيارات «نوع الوحدة» في نموذج التسجيل",
      type: "array",
      description:
        "أضف أو عدّل الخيارات كما يحتاج المشروع (تظهر في القائمة المنسدلة). القيمة المحفوظة تُرسل مع الطلب كـ unitInterest.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "القيمة المحفوظة (لاتيني، بدون مسافات)",
              type: "string",
              description: "مثل: villa أو duplex — تُستخدم في النظام والإيميل.",
              validation: (r) =>
                r.required().custom((v) => {
                  const s = String(v || "").trim();
                  if (!s) return "مطلوب";
                  if (/\s/.test(s)) return "بدون مسافات";
                  return true;
                }),
            }),
            defineField({
              name: "labelAr",
              title: "النص المعروض (عربي)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "labelEn",
              title: "النص المعروض (إنجليزي)",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { ar: "labelAr", en: "labelEn", value: "value" },
            prepare({ ar, en, value }) {
              return {
                title: [ar, en].filter(Boolean).join(" / ") || String(value),
                subtitle: value ? `value: ${value}` : "",
              };
            },
          },
        },
      ],
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
