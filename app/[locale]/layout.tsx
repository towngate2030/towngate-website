import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { routing } from "@/i18n/routing";
import { ClientCacheBuster } from "@/components/ClientCacheBuster";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: {
      default: `${t("siteName")} — ${t("tagline")}`,
      template: `%s | ${t("siteName")}`,
    },
    description: t("tagline"),
    alternates: {
      languages: {
        ar: `${base}/ar`,
        en: `${base}/en`,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ClientCacheBuster />
      <Header locale={locale} />
      {/* Mobile: reserve space under fixed logo + menu so inner pages are not hidden; home hero pulls up with -mt */}
      <div className="md:pt-0 pt-[4.5rem]">{children}</div>
      <Footer locale={locale} />
      <WhatsAppFab />
    </NextIntlClientProvider>
  );
}
