import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminToken, getAdminCookieName } from "@/lib/adminSession";

const BodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const expectedPass = process.env.ADMIN_PASSWORD || "";

  if (!expectedUser || !expectedPass || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: "Admin auth is not configured" },
      { status: 500 },
    );
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminToken(username);
  if (!token) {
    return NextResponse.json({ error: "Token error" }, { status: 500 });
  }

  const secure = Boolean(process.env.VERCEL || process.env.VERCEL_ENV) || process.env.NODE_ENV === "production";

  (await cookies()).set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}

