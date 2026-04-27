import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tp = await getTranslations("projects");
  const featured = getFeaturedProjects();

  return (
    <>
      <Hero locale={locale} />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading title={t("featuredTitle")} subtitle={t("featuredSubtitle")} />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale as "ar" | "en"}
              labels={{
                available: tp("available"),
                sold: tp("sold"),
                view: tp("view"),
              }}
            />
          ))}
        </div>
      </section>
      <section className="border-t border-brand-navy/10 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title={t("valuesTitle")} align="center" />
          <div className="grid gap-8 md:grid-cols-3">
            <ValueBlock title={t("v1Title")} body={t("v1Body")} />
            <ValueBlock title={t("v2Title")} body={t("v2Body")} />
            <ValueBlock title={t("v3Title")} body={t("v3Body")} />
          </div>
        </div>
      </section>
    </>
  );
}

function ValueBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-brand-navy/10 bg-tg-cream p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-navy/75">{body}</p>
    </div>
  );
}
