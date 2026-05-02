"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { HEADER_BAR_SOLID, HEADER_BAR_TRANSITION } from "./headerBar";

type Item = { href: string; label: string };

export function MobileMenu({
  locale,
  logoUrl,
  items,
  scrollElevated = false,
  aboveNavLine,
  menuOpacity = 1,
}: {
  locale: string;
  logoUrl?: string;
  items: Item[];
  /** True after page scroll — same solid bar as desktop */
  scrollElevated?: boolean;
  /** Sanity optional line above logo row */
  aboveNavLine?: string;
  /** Fades primary menu strip on scroll (1 → ~0.12) */
  menuOpacity?: number;
}) {
  const [open, setOpen] = useState(false);
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = activeLocale === "ar" ? "en" : "ar";
  // Show the OTHER language (switch target) label
  const localeLabel = activeLocale === "ar" ? "English Lang" : "اللغة العربية";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const ordered = useMemo(() => {
    // Always show in the requested order: Home, Projects, About, Contact
    return items;
  }, [items]);

  const solidBar =
    scrollElevated || open ? HEADER_BAR_SOLID : "bg-transparent";

  const line = aboveNavLine?.trim();
  const stripOpacity = open ? 1 : menuOpacity;

  return (
    <div className="tg-mobile-menu-root md:hidden">
      <div
        className={`fixed inset-x-0 top-0 z-50 ${HEADER_BAR_TRANSITION} ${solidBar}`.trim()}
      >
        <div
          className="relative mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 transition-opacity duration-150 ease-out"
          style={{ opacity: stripOpacity }}
        >
          {line ? (
            <p
              translate="no"
              className="line-clamp-2 px-10 text-center text-[11px] font-semibold leading-snug text-white drop-shadow-md"
            >
              {line}
            </p>
          ) : null}
          <div className="relative flex min-h-[3.5rem] items-center justify-center py-1">
            <div className="pointer-events-none absolute inset-x-0 flex justify-center">
              {logoUrl?.trim() ? (
                <Link
                  href="/"
                  locale={locale}
                  translate="no"
                  className="pointer-events-auto inline-flex max-h-[4rem] max-w-[min(72vw,280px)] shrink-0"
                  aria-label="Home"
                >
                  <Image
                    src={logoUrl.trim()}
                    alt=""
                    width={280}
                    height={72}
                    className="h-14 w-auto object-contain"
                    priority
                  />
                </Link>
              ) : null}
            </div>

            <div className="pointer-events-auto absolute end-0 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid h-11 w-11 place-items-center rounded-full bg-brand-orange shadow-md shadow-brand-orange/20 transition hover:brightness-110"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                <span className="grid gap-1">
                  <span className="h-0.5 w-4 rounded bg-white" />
                  <span className="h-0.5 w-4 rounded bg-white" />
                  <span className="h-0.5 w-4 rounded bg-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[60]">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, x: 8 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -8, x: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={
                line
                  ? "absolute end-4 top-[calc(5.75rem+0.5rem)] w-fit max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/10 bg-brand-navy/95 shadow-xl"
                  : "absolute end-4 top-[calc(4.5rem+0.5rem)] w-fit max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/10 bg-brand-navy/95 shadow-xl"
              }
            >
              <nav className="flex flex-col gap-1 p-2">
                {ordered.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    locale={locale}
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-[10px] bg-brand-orange px-4 text-center text-[14px] font-extrabold text-white transition hover:brightness-110 active:brightness-105"
                  >
                    {it.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.replace(pathname, { locale: nextLocale });
                  }}
                  className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-[10px] bg-brand-orange px-4 text-center text-[14px] font-extrabold text-white transition hover:brightness-110 active:brightness-105"
                >
                  {localeLabel}
                </button>
              </nav>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

