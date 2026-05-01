import { getLocale } from "next-intl/server";

/** Prevents Chrome “Translate” from duplicating Arabic + English in the same card. */
export default async function NewsletterSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <div lang={locale} translate="no">
      {children}
    </div>
  );
}
