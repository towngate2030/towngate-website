"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:text-white"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "English" : "العربية"}
    </button>
  );
}
