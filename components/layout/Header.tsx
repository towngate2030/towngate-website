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

  const mobileLinks = links.filter((l) => l.href !== "/contact");

  const navBtn =
    "rounded-full bg-brand-orange px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-brand-orange/20 transition hover:brightness-110";

  return (
    <header className="sticky top-0 z-50 bg-amber-100/95 shadow-sm md:absolute md:inset-x-0 md:top-0 md:bg-transparent md:shadow-none">
      {/* Desktop row */}
      <div className="mx-auto hidden max-w-6xl items-center justify-between gap-3 px-4 py-2 md:flex md:px-6 md:py-3">
        <Logo locale={locale} logoUrl={hero.logoUrl || undefined} />
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              locale={locale}
              className="rounded-full bg-brand-orange px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-brand-orange shadow-lg shadow-brand-orange/25 transition hover:brightness-110">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
      {/* Mobile: single row, one logo only */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <div className="flex items-center gap-2 py-2">
          <div className="rounded-full bg-brand-orange shadow-md shadow-brand-orange/20">
            <LocaleSwitcher />
          </div>
          <nav className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mobileLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                locale={locale}
                className={`shrink-0 ${navBtn}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="shrink-0 ms-auto">
            <Logo locale={locale} logoUrl={hero.logoUrl || undefined} />
          </div>
        </div>
      </div>
    </header>
  );
}
