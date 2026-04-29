import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjectsForSite } from "@/lib/cms";

type Props = { params: Promise<{ locale: string }> };

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("projects");
  const projects = await getProjectsForSite();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-8 grid-cols-1">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            locale={locale as "ar" | "en"}
            labels={{
              available: t("available"),
              sold: t("sold"),
              view: t("view"),
            }}
          />
        ))}
      </div>
    </div>
  );
}
