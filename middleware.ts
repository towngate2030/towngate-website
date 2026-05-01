import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

/** Exclude API, static files, newsletter verify/unsubscribe pages, and admin path from locale middleware. */
export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|_next|_vercel|tg-cp-internal|newsletter(?:/|$)|.*\\..*).*)",
  ],
};
