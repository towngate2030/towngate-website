import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { HeroVideoLead } from "@/components/home/HeroVideoLead";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  getFeaturedProjectsForSite,
  getHeroSettings,
  getHeroVideoLeadSettings,
  getValueBoxes,
} from "@/lib/cms";
import type { Project } from "@/lib/projects";

type Props = { params: Promise<{ locale: string }> };

/** Always fetch fresh CMS content after Publish (avoid stale homepage ISR/cache). */
export const dynamic = "force-dynamic";

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const th = await getTranslations("hero");
  const thome = await getTranslations("home");
  const tp = await getTranslations("projects");
  const hero = await getHeroSettings();
  const videoHero = await getHeroVideoLeadSettings();
  const boxes = await getValueBoxes();
  const featured = await getFeaturedProjectsForSite();
  const first = featured?.[0];
  const detailsHref = first ? `/projects/${first.slug}` : "/projects";
  const loc = locale as "ar" | "en";

  return (
    <>
      {videoHero ? (
        <HeroVideoLead
          backgroundVideoUrl={videoHero.backgroundVideoUrl}
          posterUrl={videoHero.posterUrl}
          title={videoHero.title[loc]}
          tagline={videoHero.tagline[loc]}
          videoMuted={videoHero.videoMuted}
        />
      ) : (
        <Hero
          locale={locale}
          bgUrl={hero.heroBgUrl || undefined}
          logoUrl={hero.logoUrl || undefined}
          kicker={hero.kicker[loc]}
          title={hero.title[loc]}
          subtitle={hero.subtitle[loc]}
          primaryCta={{ href: detailsHref, label: th("ctaProjects") }}
        />
      )}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          title={locale === "ar" ? "مشاريع مميزة" : "Featured projects"}
          subtitle={
            locale === "ar"
              ? "لمحة من محفظة TownGate."
              : "A glimpse of TownGate’s portfolio."
          }
        />
        <div className="grid gap-8 grid-cols-1">
          {featured.map((project: Project) => (
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
          <SectionHeading
            title={locale === "ar" ? "لماذا TownGate" : "Why TownGate"}
            align="center"
          />
          <div className="grid gap-8 md:grid-cols-3">
            {boxes
              .sort((a, b) => a.order - b.order)
              .slice(0, 3)
              .map((b) => (
                <ValueBlock
                  key={b.order}
                  title={b.title[locale as "ar" | "en"]}
                  body={b.body[locale as "ar" | "en"]}
                />
              ))}
          </div>
        </div>
      </section>

      {hero.homeMapUrl ? (
        <section className="border-t border-brand-navy/10 bg-tg-cream py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <a
                href={hero.homeMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-brand-navy px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-navy/20 transition hover:brightness-110"
              >
                {thome("mapCta")}
              </a>
            </div>
          </div>
        </section>
      ) : null}
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
