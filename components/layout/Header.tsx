import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getHeroSettings } from "@/lib/cms";
import { MobileMenu } from "./MobileMenu";

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
    <>
      <MobileMenu locale={locale} logoUrl={hero.logoUrl || undefined} items={links as unknown as { href: string; label: string }[]} />
      <header className="hidden md:block md:absolute md:inset-x-0 md:top-0 md:z-50 md:bg-transparent">
        {/* Desktop row */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6 md:py-3">
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
      </header>
    </>
  );
}
