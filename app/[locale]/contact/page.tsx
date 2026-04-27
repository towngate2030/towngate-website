import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { getWhatsAppUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  await params;
  const t = await getTranslations("contact");
  const tw = await getTranslations("whatsapp");
  const wa = getWhatsAppUrl(tw("prefill"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-brand-navy/80">{t("subtitle")}</p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-brand-orange px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
          >
            {tw("label")}
          </a>
        </div>
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
