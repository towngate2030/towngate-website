import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";
import { getAboutBody } from "@/lib/cms";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const about = await getAboutBody();
  const value =
    (about[locale as "ar" | "en"] as unknown as PortableTextBlock[]) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <SectionHeading title={t("title")} />
      {value.length ? (
        <div className="prose prose-lg max-w-none text-brand-navy/85">
          <PortableText value={value} />
        </div>
      ) : (
        <p className="text-lg leading-relaxed text-brand-navy/85">{t("body")}</p>
      )}
    </div>
  );
}
