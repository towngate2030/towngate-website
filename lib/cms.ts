import { sanityClient } from "@/lib/sanity";
import { getFeaturedProjects as getSeedFeatured, getProjects as getSeedProjects } from "@/lib/projects";

export type Locale = "ar" | "en";

export type HeroSettings = {
  logoUrl?: string;
  heroBgUrl: string;
  homeMapUrl?: string;
  kicker: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  valueBoxes: Array<{
    order: number;
    title: Record<Locale, string>;
    body: Record<Locale, string>;
  }>;
  whatsappContacts: Array<{ order: number; name: string; e164: string }>;
};

export async function getHeroSettings(): Promise<HeroSettings> {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!pid) {
    return seedHero();
  }

  type SiteSettingsDoc = {
    logoUrl?: string;
    heroBgUrl?: string;
    homeMapUrl?: string;
    kickerAr?: string;
    kickerEn?: string;
    heroTitleAr?: string;
    heroTitleEn?: string;
    heroSubtitleAr?: string;
    heroSubtitleEn?: string;
    valueBoxes?: Array<{
      order?: number;
      titleAr?: string;
      titleEn?: string;
      bodyAr?: string;
      bodyEn?: string;
    }>;
    whatsappContacts?: Array<{ order?: number; name?: string; e164?: string }>;
  };

  const doc = await sanityClient.fetch<SiteSettingsDoc | null>(
    `*[_type=="siteSettings"][0]{
      logoUrl,
      heroBgUrl,
      homeMapUrl,
      kickerAr,kickerEn,
      heroTitleAr,heroTitleEn,
      heroSubtitleAr,heroSubtitleEn,
      valueBoxes[]{order,titleAr,titleEn,bodyAr,bodyEn},
      whatsappContacts[]{order,name,e164}
    }`,
  );

  if (!doc) return seedHero();

  return {
    logoUrl: doc.logoUrl || "",
    heroBgUrl: doc.heroBgUrl || "",
    homeMapUrl: doc.homeMapUrl || "",
    kicker: { ar: doc.kickerAr || seedHero().kicker.ar, en: doc.kickerEn || seedHero().kicker.en },
    title: { ar: doc.heroTitleAr || seedHero().title.ar, en: doc.heroTitleEn || seedHero().title.en },
    subtitle: { ar: doc.heroSubtitleAr || seedHero().subtitle.ar, en: doc.heroSubtitleEn || seedHero().subtitle.en },
    valueBoxes: (doc.valueBoxes || [])
      .map((b) => ({
        order: Number(b.order || 0),
        title: { ar: String(b.titleAr || ""), en: String(b.titleEn || "") },
        body: { ar: String(b.bodyAr || ""), en: String(b.bodyEn || "") },
      }))
      .filter((b) => b.order),
    whatsappContacts: (doc.whatsappContacts || [])
      .map((c) => ({
        order: Number(c.order || 0),
        name: String(c.name || ""),
        e164: String(c.e164 || "").replace(/\D/g, ""),
      }))
      .filter((c) => c.order && c.e164),
  };
}

function seedHero(): HeroSettings {
  return {
    logoUrl: "",
    heroBgUrl: "",
    homeMapUrl: "",
    kicker: { ar: "كمبوند — العاصمة الإدارية", en: "Compound — New Capital" },
    title: {
      ar: "نصمّم أماكن تعيش فيها القصة.",
      en: "We craft places where stories live.",
    },
    subtitle: {
      ar: "مشاريع مختارة، جودة تنفيذ، وشراكة تبدأ من أول محادثة.",
      en: "Curated projects, refined delivery, and a partnership that starts with a conversation.",
    },
    valueBoxes: [
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
    ],
    whatsappContacts: [{ order: 1, name: "Sales", e164: "966593053792" }],
  };
}

export async function getValueBoxes() {
  const hero = await getHeroSettings();
  return hero.valueBoxes.length ? hero.valueBoxes : seedHero().valueBoxes;
}

export async function getWhatsAppContacts() {
  const hero = await getHeroSettings();
  return hero.whatsappContacts.length ? hero.whatsappContacts : seedHero().whatsappContacts;
}

export async function getAboutBody() {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!pid) {
    return { ar: [], en: [] } as { ar: unknown[]; en: unknown[] };
  }

  type Doc = { aboutBodyAr?: unknown[]; aboutBodyEn?: unknown[] };
  const doc = await sanityClient.fetch<Doc | null>(
    `*[_type=="siteSettings"][0]{ aboutBodyAr, aboutBodyEn }`,
  );

  return {
    ar: doc?.aboutBodyAr || [],
    en: doc?.aboutBodyEn || [],
  };
}

export type SiteUnitLayoutItem = {
  itemNameAr: string;
  itemNameEn: string;
  image: string;
  optionalPdf?: string;
  order: number;
  isActive: boolean;
};

export type SiteUnitLayoutGroup = {
  groupNameAr: string;
  groupNameEn: string;
  order: number;
  isActive: boolean;
  items: SiteUnitLayoutItem[];
};

export type SiteProject = {
  slug: string;
  featured: boolean;
  status: "available" | "sold";
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  location: Record<Locale, string>;
  coverImage: string;
  gallery: string[];
  videoUrls: string[];
  unitLayoutGroups: SiteUnitLayoutGroup[];
  bodyPortable: { ar: unknown[]; en: unknown[] };
  // Compatibility with existing `Project` UI types
  body: Record<Locale, string>;
};

function isHttpUrl(s: unknown): s is string {
  const v = String(s || "").trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

function normalizeUnitLayoutGroups(raw: unknown): SiteUnitLayoutGroup[] {
  if (!Array.isArray(raw)) return [];

  const groups = raw
    .map((g) => {
      const group = g as {
        groupNameAr?: string;
        groupNameEn?: string;
        order?: number;
        isActive?: boolean;
        items?: unknown[];
      };

      const items = (Array.isArray(group.items) ? group.items : [])
        .map((it) => {
          const x = it as {
            itemNameAr?: string;
            itemNameEn?: string;
            image?: string;
            optionalPdf?: string;
            order?: number;
            isActive?: boolean;
          };

          const image = isHttpUrl(x.image) ? x.image.trim() : "";
          const optionalPdf = isHttpUrl(x.optionalPdf) ? x.optionalPdf.trim() : undefined;

          const item: SiteUnitLayoutItem = {
            itemNameAr: String(x.itemNameAr || "").trim(),
            itemNameEn: String(x.itemNameEn || "").trim(),
            image,
            optionalPdf,
            order: Number(x.order || 0),
            isActive: Boolean(x.isActive),
          };

          return item;
        })
        .filter((x) => x.isActive && x.image && (x.itemNameAr || x.itemNameEn))
        .sort((a, b) => a.order - b.order);

      const out: SiteUnitLayoutGroup = {
        groupNameAr: String(group.groupNameAr || "").trim(),
        groupNameEn: String(group.groupNameEn || "").trim(),
        order: Number(group.order || 0),
        isActive: Boolean(group.isActive),
        items,
      };

      return out;
    })
    .filter(
      (g) =>
        g.isActive &&
        g.items.length > 0 &&
        (g.groupNameAr || g.groupNameEn),
    )
    .sort((a, b) => a.order - b.order);

  return groups;
}

export async function getProjectsForSite(): Promise<SiteProject[]> {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!pid) return getSeedProjects() as unknown as SiteProject[];

  type ProjectDoc = {
    slug?: string;
    featured?: boolean;
    status?: string;
    titleAr?: string;
    titleEn?: string;
    excerptAr?: string;
    excerptEn?: string;
    locationAr?: string;
    locationEn?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    unitLayoutGroups?: unknown[];
    bodyAr?: unknown[];
    bodyEn?: unknown[];
  };

  const rows = await sanityClient.fetch<ProjectDoc[] | null>(
    `*[_type=="project"]|order(_updatedAt desc){
      "slug": slug.current,
      featured,status,
      titleAr,titleEn,excerptAr,excerptEn,locationAr,locationEn,
      imageUrls, videoUrls,
      unitLayoutGroups,
      bodyAr, bodyEn
    }`,
  );

  if (!rows?.length) return getSeedProjects() as unknown as SiteProject[];

  return rows
    .filter((p) => p.slug)
    .map((p) => ({
      slug: p.slug as string,
      featured: Boolean(p.featured),
      status: p.status === "sold" ? "sold" : "available",
      title: { ar: p.titleAr || "", en: p.titleEn || "" },
      excerpt: { ar: p.excerptAr || "", en: p.excerptEn || "" },
      location: { ar: p.locationAr || "", en: p.locationEn || "" },
      coverImage: (p.imageUrls?.[0] as string) || "",
      gallery: (p.imageUrls || []).slice(1),
      videoUrls: (p.videoUrls || []).slice(0, 2),
      unitLayoutGroups: normalizeUnitLayoutGroups(p.unitLayoutGroups),
      bodyPortable: { ar: p.bodyAr || [], en: p.bodyEn || [] },
      body: { ar: "", en: "" },
    }));
}

export async function getFeaturedProjectsForSite() {
  const all = await getProjectsForSite();
  const featured = all.filter((p) => p.featured);
  // If Sanity has projects but none marked featured yet,
  // show the latest projects instead of falling back to seed data (which can 404).
  if (featured.length) return featured;
  if (all.length) return all;
  return getSeedFeatured() as unknown as SiteProject[];
}

export async function getProjectBySlugForSite(slug: string) {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  // If Sanity isn't configured, fall back to seed content
  if (!pid) {
    const all = await getProjectsForSite();
    return all.find((p) => p.slug === slug);
  }

  // Fetch directly by slug to avoid edge cases with non-latin slugs
  type ProjectDoc = {
    slug?: string;
    featured?: boolean;
    status?: string;
    titleAr?: string;
    titleEn?: string;
    excerptAr?: string;
    excerptEn?: string;
    locationAr?: string;
    locationEn?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    unitLayoutGroups?: unknown[];
    bodyAr?: unknown[];
    bodyEn?: unknown[];
  };

  const candidates = Array.from(
    new Set(
      [slug, safeDecode(slug)]
        .map((s) => String(s || "").trim())
        .filter(Boolean),
    ),
  );

  const row = await sanityClient.fetch<ProjectDoc | null>(
    `*[_type=="project" && slug.current in $slugs][0]{
      "slug": slug.current,
      featured,status,
      titleAr,titleEn,excerptAr,excerptEn,locationAr,locationEn,
      imageUrls, videoUrls,
      unitLayoutGroups,
      bodyAr, bodyEn
    }`,
    { slugs: candidates },
  );

  if (!row?.slug) {
    // fallback to in-memory list if query fails (CDN mismatch etc.)
    const all = await getProjectsForSite();
    return all.find((p) => candidates.includes(p.slug));
  }

  return {
    slug: row.slug,
    featured: Boolean(row.featured),
    status: row.status === "sold" ? "sold" : "available",
    title: { ar: row.titleAr || "", en: row.titleEn || "" },
    excerpt: { ar: row.excerptAr || "", en: row.excerptEn || "" },
    location: { ar: row.locationAr || "", en: row.locationEn || "" },
    coverImage: (row.imageUrls?.[0] as string) || "",
    gallery: (row.imageUrls || []).slice(1),
    videoUrls: (row.videoUrls || []).slice(0, 2),
    unitLayoutGroups: normalizeUnitLayoutGroups(row.unitLayoutGroups),
    bodyPortable: { ar: row.bodyAr || [], en: row.bodyEn || [] },
    body: { ar: "", en: "" },
  };
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
