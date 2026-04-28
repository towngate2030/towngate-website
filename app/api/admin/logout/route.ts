import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminSession";

export async function POST() {
  (await cookies()).set(getAdminCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: Boolean(process.env.VERCEL || process.env.VERCEL_ENV) || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}

