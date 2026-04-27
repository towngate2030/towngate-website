import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  await params;
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <SectionHeading title={t("title")} />
      <p className="text-lg leading-relaxed text-brand-navy/85">{t("body")}</p>
    </div>
  );
}
