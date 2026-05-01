"use client";

import { useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

const OVERLAY_OPACITY = 0.5;

export type HeroVideoLeadProps = {
  backgroundVideoUrl: string;
  posterUrl?: string;
  /** اسم المشروع من Sanity */
  title: string;
  videoMuted: boolean;
};

export function HeroVideoLead({
  backgroundVideoUrl,
  posterUrl,
  title,
  videoMuted,
}: HeroVideoLeadProps) {
  const locale = useLocale() as "ar" | "en";
  const th = useTranslations("heroLead");
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  useEffect(() => {
    if (!prefersReducedMotion) return;
    const v = document.querySelector("video[data-hero-video]");
    if (v instanceof HTMLVideoElement) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
  }, [prefersReducedMotion]);

  return (
    <section className="relative isolate min-h-[min(100svh,920px)] overflow-hidden bg-black text-white">
      {!prefersReducedMotion ? (
        <video
          data-hero-video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={backgroundVideoUrl}
          poster={posterUrl}
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      ) : posterUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={posterUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-neutral-900" aria-hidden />
      )}

      <div
        className="absolute inset-0 z-[1] bg-black"
        style={{ opacity: OVERLAY_OPACITY }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(100svh,920px)] max-w-6xl flex-col px-4 pb-12 pt-24 md:px-6 md:pb-16 md:pt-28">
        <div className="flex flex-1 flex-col items-center text-center">
          {title ? (
            <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {title}
            </h1>
          ) : null}
          <div
            className="mx-auto mt-4 h-0.5 w-14 rounded-full bg-brand-orange"
            aria-hidden
          />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-xl">
            {th("subtitle")}
          </p>
        </div>

        <div className="mt-10 flex w-full justify-center md:mt-14">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/45 p-5 shadow-xl backdrop-blur-md md:p-6">
            <h2 className="text-center text-lg font-bold text-white md:text-xl">
              {th("formTitle")}
            </h2>
            <div
              className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-brand-orange"
              aria-hidden
            />

            <LeadFormFields
              locale={locale}
              status={status}
              onSubmitting={(v) => setStatus(v)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadFormFields({
  locale,
  status,
  onSubmitting,
}: {
  locale: "ar" | "en";
  status: "idle" | "loading" | "ok" | "err";
  onSubmitting: (s: "idle" | "loading" | "ok" | "err") => void;
}) {
  const t = useTranslations("leadForm");
  const th = useTranslations("heroLead");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmitting("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = String(fd.get("website") || "").trim();
    if (website) {
      onSubmitting("idle");
      return;
    }

    const payload = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      unitInterest: String(fd.get("unitInterest") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      locale,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        onSubmitting("err");
        return;
      }
      onSubmitting("ok");
      form.reset();
    } catch {
      onSubmitting("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <label className="sr-only" htmlFor="lead-name">
        {t("name")}
      </label>
      <input
        id="lead-name"
        name="name"
        required
        autoComplete="name"
        placeholder={`${t("name")} *`}
        className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-brand-orange/30 focus:ring-2"
      />
      <label className="sr-only" htmlFor="lead-phone">
        {t("phone")}
      </label>
      <input
        id="lead-phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
        placeholder={`${t("phone")} *`}
        className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-brand-orange/30 focus:ring-2"
      />
      <label className="sr-only" htmlFor="lead-unit">
        {t("unitInterest")}
      </label>
      <input
        id="lead-unit"
        name="unitInterest"
        placeholder={t("unitInterest")}
        className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-brand-orange/30 focus:ring-2"
      />
      <label className="sr-only" htmlFor="lead-message">
        {t("message")}
      </label>
      <textarea
        id="lead-message"
        name="message"
        rows={3}
        placeholder={t("message")}
        className="resize-none rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none ring-brand-orange/30 focus:ring-2"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "ok"}
        className="mt-2 rounded-xl bg-brand-orange px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "loading" ? t("sending") : th("submit")}
      </button>
      {status === "ok" ? (
        <p className="text-center text-sm font-semibold text-green-300">{t("success")}</p>
      ) : null}
      {status === "err" ? (
        <p className="text-center text-sm font-semibold text-red-300">{t("error")}</p>
      ) : null}
    </form>
  );
}
