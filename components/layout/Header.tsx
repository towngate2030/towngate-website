import { getTranslations } from "next-intl/server";
import { getHeroSettings } from "@/lib/cms";
import { SiteHeader } from "./SiteHeader";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  const hero = await getHeroSettings();

  const links = [
    { href: "/", label: t("home") },
    { href: "/projects", label: t("projects") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  const loc = locale as "ar" | "en";
  const aboveNavLine = hero.aboveNavLine[loc]?.trim() || undefined;

  return (
    <SiteHeader
      locale={locale}
      logoUrl={hero.logoUrl || undefined}
      links={links as unknown as { href: string; label: string }[]}
      aboveNavLine={aboveNavLine}
    />
  );
}
