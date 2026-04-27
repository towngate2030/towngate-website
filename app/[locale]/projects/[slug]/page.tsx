import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations("projects");
  const tw = await getTranslations("whatsapp");
  const title = project.title[locale as "ar" | "en"];
  const body = project.body[locale as "ar" | "en"];
  const loc = project.location[locale as "ar" | "en"];
  const wa = getWhatsAppUrl(
    `${tw("prefill")} (${title})`,
  );

  return (
    <article className="pb-16">
      <div className="relative aspect-[21/9] max-h-[420px] w-full bg-brand-navy">
        <Image
          src={project.coverImage}
          alt={title}
          fill
          className="object-cover opacity-95"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 pb-10 md:px-6">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
            {loc}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <Link
          href="/projects"
          locale={locale}
          className="text-sm font-bold text-brand-orange hover:underline"
        >
          ← {t("back")}
        </Link>
        <div className="prose prose-lg mt-6 max-w-none text-brand-navy/90">
          {body.split("\n").map((para, i) => (
            <p key={i} className="mb-4 leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {project.gallery.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <div
                key={src}
                className="relative aspect-video overflow-hidden rounded-xl"
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 400px"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-4">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-brand-orange px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
          >
            {tw("label")}
          </a>
          <Link
            href="/contact"
            locale={locale}
            className="inline-flex rounded-full border-2 border-brand-navy/20 px-8 py-3.5 text-base font-semibold text-brand-navy transition hover:border-brand-orange/40"
          >
            {locale === "ar" ? "تواصل" : "Contact"}
          </Link>
        </div>
      </div>
    </article>
  );
}
