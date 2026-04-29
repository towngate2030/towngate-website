"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "AR";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-full px-3 py-2 text-sm font-extrabold tracking-wide text-brand-navy transition hover:text-brand-navy"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {label}
    </button>
  );
}
