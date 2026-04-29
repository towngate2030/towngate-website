import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    sha:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.VERCEL_GITHUB_COMMIT_SHA ||
      null,
    ref: process.env.VERCEL_GIT_COMMIT_REF || null,
    deployedAt: new Date().toISOString(),
  });
}

