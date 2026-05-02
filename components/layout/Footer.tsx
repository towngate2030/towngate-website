import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { getWhatsAppContacts } from "@/lib/cms";

/** Developer credit — WhatsApp (E.164 without +): Egypt +20 11 0299 2950 */
const DEVELOPER_WA_URL = "https://wa.me/201102992950";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const contacts = await getWhatsAppContacts();
  const wa = getWhatsAppUrl(tw("prefill"));

  return (
    <footer className="border-t border-brand-navy/10 bg-brand-navy text-tg-cream">
      <script
        // Let the floating WhatsApp button pick the first contact without an API call.
        dangerouslySetInnerHTML={{
          __html: `window.__TG_WA=${JSON.stringify(
            contacts.map((c) => ({ name: c.name, e164: c.e164 })),
          )};`,
        }}
      />
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
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-tg-cream/60">
        <p>
          © {new Date().getFullYear()} TownGate. {t("rights")}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-tg-cream/45">
          {locale === "ar" ? (
            <>
              تم التطوير بواسطة{" "}
              <a
                href={DEVELOPER_WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-tg-cream/70 underline decoration-white/25 underline-offset-2 transition hover:text-tg-cream"
              >
                م. باسم زيدان
              </a>
            </>
          ) : (
            <>
              Developed by{" "}
              <a
                href={DEVELOPER_WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-tg-cream/70 underline decoration-white/25 underline-offset-2 transition hover:text-tg-cream"
              >
                Eng. Basem Zidan
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
