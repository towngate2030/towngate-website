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
