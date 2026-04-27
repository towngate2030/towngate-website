import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal",
  robots: { index: false, follow: false },
};

/**
 * Secret admin entry (not linked anywhere on the site).
 * Change the folder name + middleware matcher if this URL leaks.
 * Next: add real auth + CMS or DB-backed admin here.
 */
export default function InternalAdminEntryPage() {
  return (
    <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
      <div className="mx-auto max-w-lg rounded-2xl border border-white/15 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
          TownGate
        </p>
        <h1 className="mt-3 text-2xl font-bold">Internal access</h1>
        <p className="mt-4 text-sm leading-relaxed text-tg-cream/85">
          هذه صفحة دخول داخلية فقط — لا تظهر في القوائم. لاحقًا يمكن ربطها
          بلوحة تحكم حقيقية (مصادقة + تعديل مشاريع من قاعدة بيانات أو CMS).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-tg-cream/85">
          This URL is intentionally hidden from the public site. Wire your
          admin UI or authentication here when ready.
        </p>
        <p className="mt-6 text-xs text-tg-cream/50">
          Path: <code className="rounded bg-black/30 px-1.5 py-0.5">/tg-cp-internal</code> — rename
          folder + middleware exclusion together for security-through-obscurity.
        </p>
      </div>
    </div>
  );
}
