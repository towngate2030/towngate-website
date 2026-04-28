import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  // Provide a harmless fallback in build environments where env vars aren't set yet.
  // Real requests will fall back to seed content elsewhere until configured.
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "00000000",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19",
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
});

