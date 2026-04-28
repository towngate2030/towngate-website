import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import { getDb } from "@/lib/db";
import { ensureDefaults } from "@/lib/cms";

async function requireAdmin() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const s = verifyAdminToken(token);
  return s.ok;
}

const SettingsSchema = z.object({
  heroBgUrl: z.string().trim().optional().default(""),
  kickerAr: z.string().trim().min(1),
  kickerEn: z.string().trim().min(1),
  heroTitleAr: z.string().trim().min(1),
  heroTitleEn: z.string().trim().min(1),
  heroSubtitleAr: z.string().trim().min(1),
  heroSubtitleEn: z.string().trim().min(1),
  valueBoxes: z
    .array(
      z.object({
        order: z.number().int().min(1).max(3),
        titleAr: z.string().trim().min(1),
        titleEn: z.string().trim().min(1),
        bodyAr: z.string().trim().min(1),
        bodyEn: z.string().trim().min(1),
      }),
    )
    .length(3),
  whatsappContacts: z.array(
    z.object({
      order: z.number().int().min(1).max(10),
      name: z.string().trim().min(1),
      e164: z.string().trim().min(5),
    }),
  ),
});

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });

  await ensureDefaults();
  const s = await db.siteSettings.findUnique({ where: { id: 1 } });
  const boxes = await db.valueBox.findMany({ orderBy: { order: "asc" } });
  const wa = await db.whatsAppContact.findMany({ orderBy: { order: "asc" } });

  return NextResponse.json({
    settings: s,
    valueBoxes: boxes,
    whatsappContacts: wa,
  });
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    await tx.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        heroBgUrl: data.heroBgUrl,
        kickerAr: data.kickerAr,
        kickerEn: data.kickerEn,
        heroTitleAr: data.heroTitleAr,
        heroTitleEn: data.heroTitleEn,
        heroSubtitleAr: data.heroSubtitleAr,
        heroSubtitleEn: data.heroSubtitleEn,
      },
      update: {
        heroBgUrl: data.heroBgUrl,
        kickerAr: data.kickerAr,
        kickerEn: data.kickerEn,
        heroTitleAr: data.heroTitleAr,
        heroTitleEn: data.heroTitleEn,
        heroSubtitleAr: data.heroSubtitleAr,
        heroSubtitleEn: data.heroSubtitleEn,
      },
    });

    for (const b of data.valueBoxes) {
      await tx.valueBox.upsert({
        where: { order: b.order },
        create: b,
        update: b,
      });
    }

    await tx.whatsAppContact.deleteMany();
    if (data.whatsappContacts.length) {
      await tx.whatsAppContact.createMany({ data: data.whatsappContacts });
    }
  });

  return NextResponse.json({ ok: true });
}

