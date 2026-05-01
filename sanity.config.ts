import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { newsletterSendAction } from "./sanity/newsletterSendAction";
import { newsletterSendInspector } from "./sanity/newsletterSendInspector";
import { schemaTypes } from "./sanity/schemas";

// Hosted Sanity Studio build does not reliably get Next.js env vars.
// Keep env support for local dev, but fall back to the known project id.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dcgcui7d";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "towngate",
  title: "TownGate Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  document: {
    // Always register; the hook returns null for non–newsletter-issue types (schemaType filter was unreliable).
    actions: (prev) => [...prev, newsletterSendAction],
    inspectors: (prev) => [newsletterSendInspector, ...prev],
  },
});

