import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getHeroSettings } from "@/lib/cms";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  const hero = await getHeroSettings();

  const links = [
    { href: "/", label: t("home") },
    { href: "/projects", label: t("projects") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-brand-navy/85 backdrop-blur-md md:absolute md:inset-x-0 md:top-0 md:bg-transparent md:backdrop-blur-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-5">
        <Logo locale={locale} logoUrl={hero.logoUrl || undefined} />
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              locale={locale}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md transition hover:border-brand-orange/60 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-brand-orange/20"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 md:hidden">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            locale={locale}
            className="flex-1 rounded-full border border-white/20 bg-white/10 py-2 text-center text-xs font-semibold text-white/90 backdrop-blur-md"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
