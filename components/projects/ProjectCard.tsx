import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project;
  locale: "ar" | "en";
  labels: { available: string; sold: string; view: string };
};

export function ProjectCard({ project, locale, labels }: Props) {
  const title = project.title[locale];
  const excerpt = project.excerpt[locale];
  const loc = project.location[locale];
  const statusLabel =
    project.status === "available" ? labels.available : labels.sold;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl">
      <Link href={`/projects/${project.slug}`} locale={locale} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={project.coverImage}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span
          className={`absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
            project.status === "available"
              ? "bg-brand-orange text-white"
              : "bg-brand-navy/85 text-tg-cream"
          }`}
        >
          {statusLabel}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
          {loc}
        </p>
        <h3 className="mt-1 text-xl font-bold text-brand-navy">{title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-brand-navy/70">
          {excerpt}
        </p>
        <Link
          href={`/projects/${project.slug}`}
          locale={locale}
          className="mt-4 inline-flex text-sm font-bold text-brand-orange transition hover:underline"
        >
          {labels.view} →
        </Link>
      </div>
    </article>
  );
}
