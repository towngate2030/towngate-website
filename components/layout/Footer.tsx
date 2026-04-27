import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const wa = getWhatsAppUrl(tw("prefill"));

  return (
    <footer className="border-t border-brand-navy/10 bg-brand-navy text-tg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-lg font-bold tracking-tight">TownGate</p>
          <p className="mt-1 max-w-sm text-sm text-tg-cream/75">
            Compound · New Capital
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
          >
            {tw("label")}
          </a>
          <Link
            href="/contact"
            locale={locale}
            className="inline-flex items-center justify-center rounded-full border border-tg-cream/30 px-5 py-2.5 text-sm font-semibold text-tg-cream transition hover:bg-white/10"
          >
            {tn("contact")}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-tg-cream/60">
        © {new Date().getFullYear()} TownGate. {t("rights")}
      </div>
    </footer>
  );
}
