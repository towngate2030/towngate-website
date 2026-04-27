import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/projects", label: t("projects") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-navy/10 bg-tg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Logo locale={locale} />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              locale={locale}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy/80 transition hover:bg-brand-navy/5 hover:text-brand-navy"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
        </div>
      </div>
      <nav className="flex border-t border-brand-navy/5 px-2 pb-2 md:hidden">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            locale={locale}
            className="flex-1 rounded-lg py-2 text-center text-xs font-semibold text-brand-navy/85"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
