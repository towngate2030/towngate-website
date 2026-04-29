"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import Image from "next/image";

type Props = {
  locale: string;
  bgUrl?: string;
  logoUrl?: string;
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { href: string; label: string };
};

export function Hero({ locale, bgUrl, logoUrl, kicker, title, subtitle, primaryCta }: Props) {

  return (
    <section className="relative overflow-hidden bg-brand-navy text-tg-cream">
      <div className="tg-arch pointer-events-none absolute inset-0 opacity-90" />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand-orange/10 blur-3xl" />
      {bgUrl ? (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24 md:pt-24">
        {logoUrl ? (
          <div className="mb-6 flex items-center justify-start md:hidden">
            <div className="relative h-16 w-56 sm:h-20 sm:w-64">
              <Image
                src={logoUrl}
                alt="TownGate"
                fill
                className="object-contain"
                sizes="(max-width:768px) 260px, 320px"
                priority
              />
            </div>
          </div>
        ) : null}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-orange"
        >
          {kicker}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 max-w-2xl text-lg text-tg-cream/85 md:text-xl"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href={primaryCta.href}
            locale={locale}
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-orange/30 transition hover:brightness-110"
          >
            {primaryCta.label}
          </Link>
          <Link
            href="/contact"
            locale={locale}
            className="inline-flex items-center justify-center rounded-full border-2 border-tg-cream/40 px-8 py-3.5 text-base font-semibold text-tg-cream transition hover:bg-white/10"
          >
            {locale === "ar" ? "تواصل معنا" : "Get in touch"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
