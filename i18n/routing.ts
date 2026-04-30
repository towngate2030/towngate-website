import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Always start in Arabic on `/` and avoid sticky locale cookies/accept-language overrides.
  localeDetection: false,
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
