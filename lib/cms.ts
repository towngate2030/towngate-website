import { getDb } from "@/lib/db";
import { getFeaturedProjects as getSeedFeatured, getProjects as getSeedProjects } from "@/lib/projects";

export type Locale = "ar" | "en";

export type HeroSettings = {
  heroBgUrl: string;
  kicker: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
};

export type ValueBox = {
  order: number;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
};

export type WhatsAppContact = {
  order: number;
  name: string;
  e164: string;
};

export async function ensureDefaults() {
  const db = getDb();
  if (!db) return;

  const existing = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!existing) {
    await db.siteSettings.create({ data: { id: 1 } });
  }

  const boxes = await db.valueBox.findMany({ orderBy: { order: "asc" } });
  if (boxes.length === 0) {
    await db.valueBox.createMany({
      data: [
        {
          order: 1,
          titleAr: "خبرة محلية",
          titleEn: "Local expertise",
          bodyAr: "فهم عميق للسوق ولمسات تناسب المنطقة.",
          bodyEn: "Deep market insight with details that feel right for the region.",
        },
        {
          order: 2,
          titleAr: "شفافية",
          titleEn: "Transparency",
          bodyAr: "معلومات واضحة في كل مرحلة من الرحلة.",
          bodyEn: "Clear information at every step of your journey.",
        },
        {
          order: 3,
          titleAr: "إبهار بصري",
          titleEn: "Visual craft",
          bodyAr: "تجربة رقمية تعكس جودة المشروع الحقيقية.",
          bodyEn: "A digital experience that mirrors the quality of the build.",
        },
      ],
    });
  }
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const db = getDb();
  if (!db) {
    return {
      heroBgUrl: "",
      kicker: { ar: "كمبوند — العاصمة الإدارية", en: "Compound — New Capital" },
      title: {
        ar: "نصمّم أماكن تعيش فيها القصة.",
        en: "We craft places where stories live.",
      },
      subtitle: {
        ar: "مشاريع مختارة، جودة تنفيذ، وشراكة تبدأ من أول محادثة.",
        en: "Curated projects, refined delivery, and a partnership that starts with a conversation.",
      },
    };
  }

  await ensureDefaults();
  const s = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!s) return getHeroSettings();

  return {
    heroBgUrl: s.heroBgUrl,
    kicker: { ar: s.kickerAr, en: s.kickerEn },
    title: { ar: s.heroTitleAr, en: s.heroTitleEn },
    subtitle: { ar: s.heroSubtitleAr, en: s.heroSubtitleEn },
  };
}

export async function getValueBoxes(): Promise<ValueBox[]> {
  const db = getDb();
  if (!db) {
    return [
      {
        order: 1,
        title: { ar: "خبرة محلية", en: "Local expertise" },
        body: {
          ar: "فهم عميق للسوق ولمسات تناسب المنطقة.",
          en: "Deep market insight with details that feel right for the region.",
        },
      },
      {
        order: 2,
        title: { ar: "شفافية", en: "Transparency" },
        body: {
          ar: "معلومات واضحة في كل مرحلة من الرحلة.",
          en: "Clear information at every step of your journey.",
        },
      },
      {
        order: 3,
        title: { ar: "إبهار بصري", en: "Visual craft" },
        body: {
          ar: "تجربة رقمية تعكس جودة المشروع الحقيقية.",
          en: "A digital experience that mirrors the quality of the build.",
        },
      },
    ];
  }

  await ensureDefaults();
  const rows = await db.valueBox.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    order: r.order,
    title: { ar: r.titleAr, en: r.titleEn },
    body: { ar: r.bodyAr, en: r.bodyEn },
  }));
}

export async function getWhatsAppContacts(): Promise<WhatsAppContact[]> {
  const db = getDb();
  if (!db) {
    return [{ order: 1, name: "Sales", e164: "966593053792" }];
  }

  const rows = await db.whatsAppContact.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) {
    await db.whatsAppContact.create({
      data: { order: 1, name: "Sales", e164: "966593053792" },
    });
    return [{ order: 1, name: "Sales", e164: "966593053792" }];
  }
  return rows.map((r) => ({ order: r.order, name: r.name, e164: r.e164 }));
}

export async function getProjectsForSite() {
  const db = getDb();
  if (!db) return getSeedProjects();
  const rows = await db.project.findMany({ orderBy: { updatedAt: "desc" } });
  if (rows.length === 0) return getSeedProjects();
  return rows.map((p) => ({
    slug: p.slug,
    featured: p.featured,
    status: (p.status === "sold" ? "sold" : "available") as "sold" | "available",
    title: { ar: p.titleAr, en: p.titleEn },
    excerpt: { ar: p.excerptAr, en: p.excerptEn },
    body: { ar: JSON.stringify(p.bodyAr), en: JSON.stringify(p.bodyEn) },
    location: { ar: p.locationAr, en: p.locationEn },
    coverImage: p.imageUrls[0] || "",
    gallery: p.imageUrls.slice(1),
  }));
}

export async function getFeaturedProjectsForSite() {
  const all = await getProjectsForSite();
  const featured = all.filter((p) => p.featured);
  return featured.length ? featured : getSeedFeatured();
}

