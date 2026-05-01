import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { sha256Base64Url } from "@/lib/newsletter";
import { resolveRedirectOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

type SubscriberRow = {
  _id: string;
  status?: string | null;
  verificationTokenExpiresAt?: string | null;
};

function redirectTo(
  req: Request,
  path: string,
  /** Use 303 after POST so the browser follows with GET (307 would repeat POST and break the flow). */
  status: 302 | 303 = 302,
): NextResponse {
  const origin = resolveRedirectOrigin(req);
  if (!origin) {
    return NextResponse.json(
      { ok: false, error: "Site URL is not configured (set NEXT_PUBLIC_SITE_URL)" },
      { status: 500 },
    );
  }
  return NextResponse.redirect(new URL(path, `${origin}/`), status);
}

async function verifyWithToken(req: Request, token: string): Promise<NextResponse> {
  console.log("Token received:", token);

  if (!token || token.length < 16) {
    return redirectTo(req, "/newsletter/verify?status=invalid", 303);
  }

  const write = getSanityWriteClient();
  if (!write) return redirectTo(req, "/newsletter/verify?status=server", 303);

  const tokenHash = sha256Base64Url(token);

  const subscriber = await write.fetch<SubscriberRow | null>(
    `*[_type=="newsletterSubscriber" && verificationTokenHash==$h][0]{_id,status,verificationTokenExpiresAt}`,
    { h: tokenHash },
  );
  console.log("Subscriber found:", subscriber);

  if (!subscriber?._id) return redirectTo(req, "/newsletter/verify?status=invalid", 303);

  const exp = subscriber.verificationTokenExpiresAt
    ? Date.parse(subscriber.verificationTokenExpiresAt)
    : NaN;
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return redirectTo(req, "/newsletter/verify?status=expired", 303);
  }

  const now = new Date().toISOString();
  try {
    await write
      .patch(subscriber._id)
      .set({
        status: "verified",
        verifiedAt: now,
      })
      .unset(["verificationTokenHash", "verificationTokenExpiresAt"])
      .commit();
  } catch (e) {
    console.error("[newsletter/verify] Sanity patch failed:", e);
    return redirectTo(req, "/newsletter/verify?status=server", 303);
  }

  return redirectTo(req, "/newsletter/verify?status=ok", 303);
}

/**
 * Legacy / scanner-safe: opening the API URL in a browser only redirects to the public page
 * with the same token — it does NOT verify. Verification happens on POST only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  if (!token || token.length < 16) {
    return redirectTo(req, "/newsletter/verify?status=invalid");
  }

  const qs = new URLSearchParams({ token }).toString();
  return redirectTo(req, `/newsletter/verify?${qs}`);
}

export async function POST(req: Request) {
  let token = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = (await req.json()) as { token?: string };
      token = String(body?.token ?? "").trim();
    } else {
      const fd = await req.formData();
      token = String(fd.get("token") ?? "").trim();
    }
  } catch {
    token = "";
  }

  return verifyWithToken(req, token);
}
