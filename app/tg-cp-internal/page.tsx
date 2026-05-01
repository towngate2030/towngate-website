import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Internal",
  robots: { index: false, follow: false },
};

/**
 * Secret admin entry (not linked anywhere on the site).
 * Change the folder name + middleware matcher if this URL leaks.
 * Next: add real auth + CMS or DB-backed admin here.
 */
export default async function InternalAdminEntryPage() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const session = verifyAdminToken(token);

  if (!session.ok) {
    return (
      <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <Image
            src="/brand/towngate-mark.svg"
            alt="TownGate"
            width={200}
            height={48}
            className="h-9 w-auto"
            priority
          />
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-tg-cream transition hover:bg-white/10">
              Logout
            </button>
          </form>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
            TownGate control panel
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            Welcome, {session.username}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-tg-cream/80">
            دي لوحة داخلية. الخطوة الجاية نركّب هنا إدارة المشاريع (إضافة/تعديل/رفع صور)
            بشكل مباشر بدل تعديل الكود.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PanelCard title="Projects" body="Add/edit projects (coming next)." />
          <PanelCard title="Posts" body="News & updates (coming next)." />
          <a
            href="/tg-cp-internal/newsletter"
            className="rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-5 transition hover:bg-brand-orange/15"
          >
            <p className="text-sm font-extrabold text-white">Newsletter</p>
            <p className="mt-2 text-xs leading-relaxed text-tg-cream/80">
              عرض المشتركين/الإصدارات وإرسال النشرة لكل الإيميلات المسجّلة (يتطلب إعدادات السيرفر).
            </p>
            <p className="mt-3 text-xs font-extrabold text-brand-orange">Open →</p>
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`https://www.sanity.io/manage`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110"
          >
            Open Sanity Studio
          </a>
          <a
            href="https://www.sanity.io/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-tg-cream transition hover:bg-white/10"
          >
            Sanity manage
          </a>
        </div>
      </div>
    </div>
  );
}

function PanelCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-navy/30 p-5">
      <p className="text-sm font-extrabold text-white">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-tg-cream/75">{body}</p>
    </div>
  );
}
