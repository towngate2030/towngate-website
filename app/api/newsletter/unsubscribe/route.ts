import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanityWrite";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectTo = (path: string) => {
    if (!siteUrl) return NextResponse.json({ ok: false, error: "Site not configured" }, { status: 500 });
    return NextResponse.redirect(new URL(path, siteUrl));
  };

  if (!token || token.length < 16) return redirectTo("/newsletter/unsubscribe?status=invalid");

  const write = getSanityWriteClient();
  if (!write) return redirectTo("/newsletter/unsubscribe?status=server");

  const row = await write.fetch<null | { _id: string }>(
    `*[_type=="newsletterSubscriber" && unsubscribeToken==$t][0]{_id}`,
    { t: token },
  );
  if (!row?._id) return redirectTo("/newsletter/unsubscribe?status=invalid");

  const now = new Date().toISOString();
  await write
    .patch(row._id)
    .set({ status: "unsubscribed", unsubscribedAt: now })
    .unset(["verificationTokenHash", "verificationTokenExpiresAt", "unsubscribeToken"])
    .commit();

  return redirectTo("/newsletter/unsubscribe?status=ok");
}

