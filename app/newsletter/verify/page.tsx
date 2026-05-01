import { getTranslations } from "next-intl/server";

function pickParam(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function NewsletterVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string | string[]; token?: string | string[] }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const status = pickParam(sp.status);
  const token = pickParam(sp.token);
  const t = await getTranslations("newsletter");

  const hasResult = Boolean(status);

  const message = !hasResult
    ? null
    : status === "ok"
      ? t("verify.ok")
      : status === "expired"
        ? t("verify.expired")
        : status === "server"
          ? t("verify.server")
          : t("verify.invalid");

  const headline = !hasResult
    ? t("verify.pageTitle")
    : status === "ok"
      ? t("verify.headlineSuccess")
      : t("verify.headlineIssue");

  return (
    <div className="min-h-screen bg-brand-navy px-6 py-16 text-tg-cream">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/15 bg-white/5 p-8">
        <h1 className="text-2xl font-extrabold text-white">{headline}</h1>

        {!hasResult && token ? (
          <div className="mt-6">
            <p className="text-sm leading-relaxed text-tg-cream/85">
              {t("verify.confirmIntro")}
            </p>
            <form
              action="/api/newsletter/verify"
              method="post"
              className="mt-6"
            >
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                {t("verify.submit")}
              </button>
            </form>
          </div>
        ) : null}

        {hasResult ? (
          <p className="mt-4 text-sm leading-relaxed text-tg-cream/85">{message}</p>
        ) : null}

        {!hasResult && !token ? (
          <p className="mt-4 text-sm leading-relaxed text-tg-cream/85">
            {t("verify.invalid")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
