import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { sha256Base64Url } from "@/lib/newsletter";
import { resolveRedirectOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  console.log("Token received:", token);

  const origin = resolveRedirectOrigin(req);
  const redirectTo = (path: string) => {
    if (!origin) {
      return NextResponse.json(
        { ok: false, error: "Site URL is not configured (set NEXT_PUBLIC_SITE_URL)" },
        { status: 500 },
      );
    }
    return NextResponse.redirect(new URL(path, `${origin}/`));
  };

  if (!token || token.length < 16) return redirectTo("/newsletter/verify?status=invalid");

  const write = getSanityWriteClient();
  if (!write) return redirectTo("/newsletter/verify?status=server");

  const tokenHash = sha256Base64Url(token);

  type SubscriberRow = {
    _id: string;
    status?: string | null;
    verificationTokenExpiresAt?: string | null;
  };

  const subscriber = await write.fetch<SubscriberRow | null>(
    `*[_type=="newsletterSubscriber" && verificationTokenHash==$h][0]{_id,status,verificationTokenExpiresAt}`,
    { h: tokenHash },
  );
  console.log("Subscriber found:", subscriber);

  if (!subscriber?._id) return redirectTo("/newsletter/verify?status=invalid");

  const exp = subscriber.verificationTokenExpiresAt
    ? Date.parse(subscriber.verificationTokenExpiresAt)
    : NaN;
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return redirectTo("/newsletter/verify?status=expired");
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
    return redirectTo("/newsletter/verify?status=server");
  }

  return redirectTo("/newsletter/verify?status=ok");
}

