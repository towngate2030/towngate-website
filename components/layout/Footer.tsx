import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { getWhatsAppContacts } from "@/lib/cms";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const contacts = await getWhatsAppContacts();
  const wa = getWhatsAppUrl(tw("prefill"));

  return (
    <footer className="border-t border-brand-navy/10 bg-brand-navy text-tg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:items-start md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight">TownGate</p>
            <p className="mt-1 max-w-sm text-sm text-tg-cream/75">
              Compound · New Capital
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {contacts.slice(0, 3).map((c) => (
              <a
                key={`${c.order}-${c.e164}`}
                href={`https://wa.me/${String(c.e164).replace(/\D/g, "")}?text=${encodeURIComponent(
                  tw("prefill"),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
              >
                {tw("label")}
                <span className="opacity-90">•</span>
                <span className="text-white/90">{c.name}</span>
              </a>
            ))}
            {contacts.length === 0 ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
              >
                {tw("label")}
              </a>
            ) : null}
            <Link
              href="/contact"
              locale={locale}
              className="inline-flex items-center justify-center rounded-full border border-tg-cream/30 px-5 py-2.5 text-sm font-semibold text-tg-cream transition hover:bg-white/10"
            >
              {tn("contact")}
            </Link>
          </div>
        </div>
        <NewsletterSignup />
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-tg-cream/60">
        © {new Date().getFullYear()} TownGate. {t("rights")}
      </div>
    </footer>
  );
}
