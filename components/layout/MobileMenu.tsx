"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

type Item = { href: string; label: string };

export function MobileMenu({
  locale,
  logoUrl,
  items,
}: {
  locale: string;
  logoUrl?: string;
  items: Item[];
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

  return (
    <div className="tg-mobile-menu-root md:hidden">
      {/* Mobile top bar: no yellow strip — transparent, logo centered & slightly larger */}
      <div className="fixed inset-x-0 top-0 z-50 bg-transparent">
        <div className="relative mx-auto flex min-h-[4.5rem] max-w-6xl items-center justify-center px-4 py-3">
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

          {/* Hamburger (aligned end in LTR = right; RTL-aware via logical inset) */}
          <div className="pointer-events-auto absolute end-4 top-1/2 -translate-y-1/2">
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
      {/* Spacer — match bar height */}
      <div className="h-[4.5rem]" />

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
              className="absolute end-4 top-[calc(4.5rem+0.5rem)] w-fit max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/10 bg-brand-navy/95 shadow-xl"
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

