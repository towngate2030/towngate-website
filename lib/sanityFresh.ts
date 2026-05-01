import { createClient } from "@sanity/client";

/**
 * Same as `sanityClient` but `useCdn: false` so content appears right after you click Publish
 * in Studio (avoids short CDN delay on the API).
 */
export const sanityFreshClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "00000000",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
