import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getFeaturedProjectsForSite, getHeroSettings, getValueBoxes } from "@/lib/cms";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const tp = await getTranslations("projects");
  const hero = await getHeroSettings();
  const boxes = await getValueBoxes();
  const featured = await getFeaturedProjectsForSite();

  return (
    <>
      <Hero
        locale={locale}
        bgUrl={hero.heroBgUrl || undefined}
        kicker={hero.kicker[locale as "ar" | "en"]}
        title={hero.title[locale as "ar" | "en"]}
        subtitle={hero.subtitle[locale as "ar" | "en"]}
      />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          title={locale === "ar" ? "مشاريع مميزة" : "Featured projects"}
          subtitle={
            locale === "ar"
              ? "لمحة من محفظة TownGate."
              : "A glimpse of TownGate’s portfolio."
          }
        />
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
