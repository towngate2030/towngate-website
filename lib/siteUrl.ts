/**
 * Canonical public origin from NEXT_PUBLIC_SITE_URL (no trailing slash).
 */
export function getCanonicalSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
}

/**
 * Absolute URL for the public confirmation page (user confirms via POST — not the API GET).
 * Requires NEXT_PUBLIC_SITE_URL in production.
 */
export function buildNewsletterVerifyLink(token: string): string {
  const base = getCanonicalSiteOrigin();
  if (!base) return "";
  const qs = new URLSearchParams({ token }).toString();
  return `${base}/newsletter/verify?${qs}`;
}

/**
 * Origin for redirects after verify/unsubscribe — env first, then request headers (Vercel), never localhost.
 */
export function resolveRedirectOrigin(req: Request): string {
  const fromEnv = getCanonicalSiteOrigin();
  if (fromEnv) return fromEnv;

  const host = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  if (host && host !== "localhost" && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  try {
    const u = new URL(req.url);
    if (u.hostname && u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
      return `${u.protocol}//${u.host}`.replace(/\/+$/, "");
    }
  } catch {
    /* ignore */
  }

  return "";
}
