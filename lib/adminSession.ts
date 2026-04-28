import crypto from "node:crypto";

const COOKIE_NAME = "__Host-tg_admin";
const SESSION_DAYS = 7;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function createAdminToken(username: string) {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * SESSION_DAYS;
  const payload = `u=${encodeURIComponent(username)}&exp=${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return { ok: false as const };
  const secret = getSecret();
  if (!secret) return { ok: false as const };

  const [payload, sig] = token.split(".", 2);
  if (!payload || !sig) return { ok: false as const };

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { ok: false as const };
    if (!crypto.timingSafeEqual(a, b)) return { ok: false as const };
  } catch {
    return { ok: false as const };
  }

  const params = new URLSearchParams(payload);
  const u = params.get("u");
  const exp = Number(params.get("exp"));
  if (!u || !Number.isFinite(exp)) return { ok: false as const };
  if (exp < Math.floor(Date.now() / 1000)) return { ok: false as const };

  return { ok: true as const, username: decodeURIComponent(u), exp };
}

