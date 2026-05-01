/**
 * Runs before other Studio modules load (import first from `sanity.config.ts`).
 * Lets `sanity dev` reuse `NEXT_PUBLIC_SITE_URL` when `SANITY_STUDIO_APP_ORIGIN` is unset.
 */
const explicit = process.env.SANITY_STUDIO_APP_ORIGIN?.trim();
if (!explicit) {
  const fromNext = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromNext) {
    process.env.SANITY_STUDIO_APP_ORIGIN = fromNext.replace(/\/$/, "");
  }
}
