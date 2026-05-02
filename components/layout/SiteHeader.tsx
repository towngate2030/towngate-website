"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { HEADER_BAR_SOLID, HEADER_BAR_TRANSITION } from "./headerBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

type NavLink = { href: string; label: string };

/** Scroll distance over which nav/menu row fades toward minimum opacity */
const MENU_FADE_RANGE_PX = 300;
const MENU_MIN_OPACITY = 0.12;
const ELEVATED_SCROLL_THRESHOLD = 48;

function menuOpacityFromScroll(scrollY: number): number {
  const t = Math.min(Math.max(scrollY, 0) / MENU_FADE_RANGE_PX, 1);
  return MENU_MIN_OPACITY + (1 - MENU_MIN_OPACITY) * (1 - t);
}

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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const elevated = scrollY >= ELEVATED_SCROLL_THRESHOLD;
  const surface = elevated ? HEADER_BAR_SOLID : "bg-transparent";
  const menuOpacity = menuOpacityFromScroll(scrollY);

  const line = aboveNavLine?.trim();

  return (
    <>
      <MobileMenu
        locale={locale}
        logoUrl={logoUrl}
        items={links}
        scrollElevated={elevated}
        aboveNavLine={line}
        menuOpacity={menuOpacity}
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

          <div
            className="flex w-full flex-col items-center transition-opacity duration-150 ease-out md:pl-[clamp(3rem,11vw,8rem)]"
            style={{ opacity: menuOpacity }}
          >
            {line ? (
              <p
                translate="no"
                className="mb-1.5 max-w-[42rem] px-2 text-center text-[13px] font-semibold leading-snug tracking-wide text-white drop-shadow-md md:text-sm"
              >
                {line}
              </p>
            ) : null}
            <div className="flex w-full justify-center">
              <nav className="flex flex-wrap items-center justify-center gap-2 px-2 py-1 md:px-6 md:py-2">
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
        </div>
      </header>
    </>
  );
}
