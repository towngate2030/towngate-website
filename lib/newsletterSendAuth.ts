import crypto from "node:crypto";
import { verifyAdminToken } from "@/lib/adminSession";

/**
 * Allows POST /api/newsletter/send either:
 * - valid admin session cookie (TownGate control panel), or
 * - Authorization: Bearer <NEWSLETTER_SEND_SECRET> (Sanity Studio browser action).
 */
export function authorizeNewsletterSend(req: Request, adminCookieToken: string | undefined): boolean {
  if (verifyAdminToken(adminCookieToken).ok) return true;

  const secret = process.env.NEWSLETTER_SEND_SECRET?.trim();
  if (!secret || secret.length < 24) return false;

  const auth = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  const bearer = m?.[1]?.trim();
  if (!bearer) return false;

  try {
    const a = Buffer.from(bearer, "utf8");
    const b = Buffer.from(secret, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
