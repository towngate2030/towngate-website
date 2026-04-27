"use client";

import { useLocale, useTranslations } from "next-intl";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFab() {
  const t = useTranslations("whatsapp");
  const locale = useLocale();
  const href = getWhatsAppUrl(t("prefill"));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-xl shadow-brand-orange/35 transition hover:scale-105 hover:brightness-110 md:bottom-8 md:h-16 md:w-16"
      style={{ [locale === "ar" ? "left" : "right"]: "1.25rem" }}
      aria-label={t("label")}
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current" aria-hidden>
        <path d="M16.003 3C9.374 3 4 8.373 4 14.995c0 2.365.618 4.586 1.7 6.503L4 29l7.745-1.634A11.94 11.94 0 0016.003 27C22.629 27 28 21.627 28 14.995 28 8.373 22.629 3 16.003 3zm0 21.2c-1.978 0-3.866-.52-5.5-1.5l-.395-.235-4.58.967.975-4.46-.258-.41A9.17 9.17 0 016.8 14.995C6.8 9.57 10.58 5.8 16.003 5.8c5.42 0 9.197 3.77 9.197 9.195 0 5.425-3.777 9.205-9.197 9.205zm5.15-6.65c-.283-.142-1.675-.826-1.933-.922-.258-.095-.446-.142-.634.142-.189.283-.728.922-.892 1.11-.165.189-.33.212-.613.071-.283-.142-1.195-.44-2.276-1.404-.842-.75-1.41-1.675-1.575-1.958-.165-.283-.018-.437.124-.578.127-.127.283-.33.425-.495.142-.165.189-.283.283-.472.095-.189.047-.354-.024-.495-.071-.142-.634-1.53-.869-2.095-.228-.548-.46-.474-.634-.483l-.54-.01c-.189 0-.495.071-.754.354-.258.283-.99.967-.99 2.358 0 1.39 1.01 2.734 1.15 2.923.142.189 1.987 3.04 4.813 4.142.673.26 1.198.415 1.607.531.675.215 1.29.185 1.776.112.54-.08 1.675-.685 1.91-1.346.236-.66.236-1.225.165-1.346-.071-.118-.258-.189-.54-.331z" />
      </svg>
    </a>
  );
}
