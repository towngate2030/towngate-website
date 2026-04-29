"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Logo } from "./Logo";

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
  const localeLabel = activeLocale === "ar" ? "اللغة العربية" : "English Lang";

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
    <div className="md:hidden">
      {/* Fixed yellow bar */}
      <div className="sticky top-0 z-50 bg-amber-100/95 shadow-sm">
        <div className="relative mx-auto flex max-w-6xl items-center px-4 py-3">
          {/* Centered logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo
              locale={locale}
              logoUrl={logoUrl}
              imgClassName="h-12 w-auto md:h-14 lg:h-16"
            />
          </div>

          {/* Hamburger (always on the RIGHT) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full bg-brand-orange shadow-md shadow-brand-orange/20 transition hover:brightness-110"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span className="grid gap-1.5">
                <span className="h-0.5 w-5 rounded bg-white" />
                <span className="h-0.5 w-5 rounded bg-white" />
                <span className="h-0.5 w-5 rounded bg-white" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/25"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-3 top-16 w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-xl">
            <div className="p-3">
              <nav className="flex flex-col gap-2">
                {ordered.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    locale={locale}
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-brand-orange px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-orange/20 transition hover:brightness-110"
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
                  className="rounded-xl bg-brand-orange px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-orange/20 transition hover:brightness-110"
                >
                  {localeLabel}
                </button>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

