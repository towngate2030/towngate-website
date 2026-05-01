import { createClient, type SanityClient } from "@sanity/client";

let cached: SanityClient | null | undefined;

/**
 * Sanity client with write access (API routes / server only).
 * Set `SANITY_API_WRITE_TOKEN` in Vercel with Editor permissions.
 */
export function getSanityWriteClient(): SanityClient | null {
  if (cached !== undefined) return cached;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || projectId === "00000000" || !token) {
    cached = null;
    return cached;
  }

  cached = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
    token,
    useCdn: false,
  });
  return cached;
}
