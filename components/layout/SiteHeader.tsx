"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { HEADER_BAR_SOLID, HEADER_BAR_TRANSITION } from "./headerBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

type NavLink = { href: string; label: string };

export function SiteHeader({
  locale,
  logoUrl,
  links,
}: {
  locale: string;
  logoUrl?: string;
  links: NavLink[];
}) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const threshold = 48;
    const onScroll = () => setElevated(window.scrollY >= threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const surface = elevated ? HEADER_BAR_SOLID : "bg-transparent";

  return (
    <>
      <MobileMenu
        locale={locale}
        logoUrl={logoUrl}
        items={links}
        scrollElevated={elevated}
      />
      <header
        className={`tg-desktop-header ${HEADER_BAR_TRANSITION} ${surface} fixed inset-x-0 top-0 z-50 hidden md:block`}
      >
        <div className="relative mx-auto min-h-[4rem] max-w-6xl px-4 py-2 md:px-6 md:py-3">
          <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 md:left-6">
            <Logo locale={locale} logoUrl={logoUrl} />
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
