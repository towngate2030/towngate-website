import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { NewsletterSendPanel, type NewsletterIssueRow } from "@/components/admin/NewsletterSendPanel";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import { sanityClient } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export default async function NewsletterAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ issue?: string }>;
}) {
  const issueHighlight = searchParams ? (await searchParams).issue : undefined;
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const session = verifyAdminToken(token);

  if (!session.ok) {
    return (
      <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
        <AdminLoginForm />
      </div>
    );
  }

  const issues = await sanityClient.fetch<NewsletterIssueRow[]>(
    `*[_type=="newsletterIssue"]|order(_updatedAt desc)[0...200]{
      _id,title,subjectLine,status,sentAt,recipientCount
    }`,
  );

  const subscriberCount = await sanityClient.fetch<number>(
    `count(*[_type=="newsletterSubscriber" && active != false && defined(email)])`,
  );

  return (
    <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/towngate-mark.svg"
              alt="TownGate"
              width={200}
              height={48}
              className="h-9 w-auto"
              priority
            />
            <Link
              href="/tg-cp-internal"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-tg-cream transition hover:bg-white/10"
            >
              ← Control panel
            </Link>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-tg-cream transition hover:bg-white/10">
              Logout
            </button>
          </form>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Newsletter</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Send broadcasts</h1>
          <p className="mt-3 text-sm leading-relaxed text-tg-cream/80">
            Subscribers are saved in Sanity when users submit the footer form. Issues are authored in Sanity (text +
            image URLs). Sending uses Resend and requires{" "}
            <span className="font-mono text-tg-cream/90">RESEND_API_KEY</span>,{" "}
            <span className="font-mono text-tg-cream/90">RESEND_FROM</span>, and{" "}
            <span className="font-mono text-tg-cream/90">SANITY_API_WRITE_TOKEN</span> on the server.
          </p>
        </div>

        <NewsletterSendPanel
          issues={issues || []}
          subscriberCount={Number(subscriberCount || 0)}
          highlightIssueId={issueHighlight}
        />
      </div>
    </div>
  );
}
