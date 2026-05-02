"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { HEADER_BAR_SOLID, HEADER_BAR_TRANSITION } from "./headerBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

type NavLink = { href: string; label: string };

const ELEVATED_SCROLL_THRESHOLD = 48;

export function SiteHeader({
  locale,
  logoUrl,
  links,
  aboveNavLine,
}: {
  locale: string;
  logoUrl?: string;
  links: NavLink[];
  /** From Sanity Site settings — optional line above nav */
  aboveNavLine?: string;
}) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setElevated(window.scrollY >= ELEVATED_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const surface = elevated ? HEADER_BAR_SOLID : "bg-transparent";

  const line = aboveNavLine?.trim();

  return (
    <>
      <MobileMenu
        locale={locale}
        logoUrl={logoUrl}
        items={links}
        scrollElevated={elevated}
        aboveNavLine={line}
      />
      <header
        className={`tg-desktop-header ${HEADER_BAR_TRANSITION} ${surface} fixed inset-x-0 top-0 z-50 hidden md:block`}
      >
        <div
          className={`relative mx-auto max-w-6xl px-4 py-2 md:px-6 md:py-3 ${line ? "min-h-[5.25rem]" : "min-h-[4rem]"}`}
        >
          <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 md:left-6">
            <Logo locale={locale} logoUrl={logoUrl} />
            <div className="shrink-0 rounded-full bg-brand-orange shadow-lg shadow-brand-orange/25 transition hover:brightness-110">
              <LocaleSwitcher />
            </div>
          </div>

          {/* True horizontal center — aligns with hero title + lead form (logo stays separate on the left) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex max-w-[min(100%,calc(100%-13rem))] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 px-2 text-center">
            {line ? (
              <p
                translate="no"
                className="pointer-events-auto mb-0 max-w-[42rem] text-[13px] font-semibold leading-snug tracking-wide text-white drop-shadow-md md:text-sm"
              >
                {line}
              </p>
            ) : null}
            <nav className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 py-1 md:py-2">
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
        </div>
      </header>
    </>
  );
}
