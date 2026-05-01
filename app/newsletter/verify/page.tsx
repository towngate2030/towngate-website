export default async function NewsletterVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const s = searchParams ? (await searchParams).status : undefined;
  const status = String(s || "");

  const message =
    status === "ok"
      ? "You're subscribed. Thanks for confirming your email."
      : status === "expired"
        ? "This confirmation link has expired. Please subscribe again."
        : status === "server"
          ? "Server error. Please try again later."
          : "Invalid confirmation link.";

  return (
    <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/15 bg-white/5 p-8">
        <h1 className="text-2xl font-extrabold text-white">Newsletter</h1>
        <p className="mt-3 text-sm text-tg-cream/85">{message}</p>
      </div>
    </div>
  );
}

