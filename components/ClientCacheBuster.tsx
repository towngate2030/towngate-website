"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * Defensive cleanup for users who still have an old Service Worker / Cache Storage
 * from a previous deployment. This can cause stale JS/HTML to be served in some
 * Chromium browsers, leading to mixed-language UI.
 */
export function ClientCacheBuster() {
  const locale = useLocale();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // 1) If an old SW exists (from a previous version), unregister it.
      if ("serviceWorker" in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        } catch {
          // ignore
        }
      }

      // 2) Clear Cache Storage (workbox/next-pwa caches etc.)
      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // ignore
        }
      }

      // 3) Normalize any previously stored locale keys to match URL locale.
      // We intentionally avoid introducing new persistence; we just prevent stale overrides.
      try {
        const wants = locale === "ar" ? "ar" : "en";
        const keys = ["NEXT_LOCALE", "locale", "lang", "language"];
        for (const k of keys) {
          const v = window.localStorage.getItem(k);
          if (v && v !== "ar" && v !== "en") {
            window.localStorage.removeItem(k);
          } else if (v && v !== wants) {
            window.localStorage.removeItem(k);
          }
        }
      } catch {
        // ignore
      }

      // 4) Ensure document lang/dir matches the active locale.
      if (cancelled) return;
      try {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      } catch {
        // ignore
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return null;
}

