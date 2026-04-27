export type LocaleText = { ar: string; en: string };

export type Project = {
  slug: string;
  title: LocaleText;
  excerpt: LocaleText;
  body: LocaleText;
  location: LocaleText;
  status: "available" | "sold";
  coverImage: string;
  gallery: string[];
  featured: boolean;
};

const projects: Project[] = [
  {
    slug: "nile-residence",
    title: {
      ar: "نايل ريزيدنس",
      en: "Nile Residence",
    },
    excerpt: {
      ar: "وحدات سكنية راقية بإطلالات مدروسة ومساحات خضراء.",
      en: "Refined residences with considered views and generous green space.",
    },
    body: {
      ar: "مشروع سكني يجمع بين الخصوصية والمجتمع النابض: واجهات معاصرة، لوبي مزدوج الارتفاع، ومسارات مشي آمنة للعائلات.",
      en: "A residential community balancing privacy and vibrancy: contemporary façades, double-height lobby, and safe walking routes for families.",
    },
    location: {
      ar: "العاصمة الإدارية",
      en: "New Administrative Capital",
    },
    status: "available",
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    featured: true,
  },
  {
    slug: "capital-gate-towers",
    title: {
      ar: "كابيتال جيت تاورز",
      en: "Capital Gate Towers",
    },
    excerpt: {
      ar: "برجا مكتبيات وتجزئة بمعايير دولية للشركات المتنامية.",
      en: "Office and retail towers with international-grade specs for growing firms.",
    },
    body: {
      ar: "مساحات عمل مرنة، واجهات زجاجية عالية الأداء، ومواقف ذكية—مصممة لشركات تحتاج انطباعًا أولًا قويًا.",
      en: "Flexible floorplates, high-performance glazing, and smart parking—built for brands that need a commanding first impression.",
    },
    location: {
      ar: "العاصمة الإدارية",
      en: "New Administrative Capital",
    },
    status: "available",
    coverImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    ],
    featured: true,
  },
  {
    slug: "oasis-villas",
    title: {
      ar: "واحات أواسيس",
      en: "Oasis Villas",
    },
    excerpt: {
      ar: "مجمع فيلات بحدائق خاصة وتشطيبات فاخرة.",
      en: "Villa compound with private gardens and premium finishes.",
    },
    body: {
      ar: "فيلات بمساحات متنوعة، نوافذ بانورامية، ومناطق ترفيه للعائلات—نموذج للحياة الهادئة خارج الزحام.",
      en: "Varied villa sizes, panoramic glazing, and family recreation zones—a template for calm living beyond the rush.",
    },
    location: {
      ar: "القاهرة الجديدة",
      en: "New Cairo",
    },
    status: "sold",
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    gallery: [],
    featured: true,
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
