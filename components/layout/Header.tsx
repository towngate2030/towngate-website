import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getHeroSettings } from "@/lib/cms";
import { Logo } from "./Logo";
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
      <MobileMenu
        locale={locale}
        logoUrl={hero.logoUrl || undefined}
        items={links as unknown as { href: string; label: string }[]}
      />
      <header className="tg-desktop-header hidden md:block md:absolute md:inset-x-0 md:top-0 md:z-50 md:bg-transparent">
        {/* Logo + language fixed on physical left — nav stays centered (avoids overlap with video logo on the other side) */}
        <div className="relative mx-auto min-h-[4rem] max-w-6xl px-4 py-2 md:px-6 md:py-3">
          <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 md:left-6">
            <Logo locale={locale} logoUrl={hero.logoUrl || undefined} />
            <div className="shrink-0 rounded-full bg-brand-orange shadow-lg shadow-brand-orange/25 transition hover:brightness-110">
              <LocaleSwitcher />
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-2 px-2 py-1 md:px-44 md:py-2">
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
        </div>
      </header>
    </>
  );
}
