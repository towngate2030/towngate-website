import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const session = verifyAdminToken(token);

  if (!session.ok) {
    return (
      <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/15 bg-white/5 p-8">
          <p className="text-sm text-tg-cream/85">
            Please login first at{" "}
            <a className="font-bold text-brand-orange underline" href="/tg-cp-internal">
              /tg-cp-internal
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy px-6 py-12 text-tg-cream">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/towngate-mark.svg"
            alt="TownGate"
            width={180}
            height={48}
            className="h-9 w-auto"
            priority
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
              Admin
            </p>
            <p className="text-sm font-semibold text-tg-cream/85">
              Settings & homepage content
            </p>
          </div>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-tg-cream transition hover:bg-white/10">
            Logout
          </button>
        </form>
      </div>

      <AdminSettingsForm />
    </div>
  );
}

