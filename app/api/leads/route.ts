import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { getSanityWriteClient } from "@/lib/sanityWrite";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const honeypot = String(b.website ?? "").trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const name = String(b.name ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const unitInterest = String(b.unitInterest ?? "").trim();
  const message = String(b.message ?? "").trim();
  const localeRaw = String(b.locale ?? "").trim();
  const locale = localeRaw === "en" ? "en" : "ar";

  if (!name || !phone || phone.length < 5) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const saveFlag = await sanityClient.fetch<boolean | null>(
    `*[_type=="heroVideoLead"][0].saveLeadsToSanity`,
  );

  const shouldSave = saveFlag !== false;

  if (!shouldSave) {
    return NextResponse.json({ ok: true, message: "accepted" });
  }

  const write = getSanityWriteClient();
  if (!write) {
    console.error("[leads] SANITY_API_WRITE_TOKEN missing while saveLeadsToSanity is enabled");
    return NextResponse.json(
      { error: "Lead storage is not configured on the server." },
      { status: 503 },
    );
  }

  try {
    await write.create({
      _type: "lead",
      name,
      phone,
      ...(unitInterest ? { unitInterest } : {}),
      ...(message ? { message } : {}),
      locale,
      source: "hero_video",
      submittedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[leads] Sanity create failed:", e);
    return NextResponse.json({ error: "Could not save lead" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
