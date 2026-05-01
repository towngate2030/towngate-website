import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";
import { sha256Base64Url } from "@/lib/newsletter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectTo = (path: string) => {
    if (!siteUrl) return NextResponse.json({ ok: false, error: "Site not configured" }, { status: 500 });
    return NextResponse.redirect(new URL(path, siteUrl));
  };

  if (!token || token.length < 16) return redirectTo("/newsletter/verify?status=invalid");

  const write = getSanityWriteClient();
  if (!write) return redirectTo("/newsletter/verify?status=server");

  const tokenHash = sha256Base64Url(token);

  const row = await write.fetch<
    | null
    | {
        _id: string;
        status?: string | null;
        verificationTokenExpiresAt?: string | null;
      }
  >(
    `*[_type=="newsletterSubscriber" && verificationTokenHash==$h][0]{_id,status,verificationTokenExpiresAt}`,
    { h: tokenHash },
  );

  if (!row?._id) return redirectTo("/newsletter/verify?status=invalid");

  const exp = row.verificationTokenExpiresAt ? Date.parse(row.verificationTokenExpiresAt) : NaN;
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return redirectTo("/newsletter/verify?status=expired");
  }

  const now = new Date().toISOString();
  await write
    .patch(row._id)
    .set({
      status: "verified",
      verifiedAt: now,
    })
    .unset(["verificationTokenHash", "verificationTokenExpiresAt"])
    .commit();

  return redirectTo("/newsletter/verify?status=ok");
}

