import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { newsletterBroadcastAction } from "./sanity/newsletterBroadcastAction";
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
    actions: (prev, ctx) => (ctx.schemaType === "newsletterIssue" ? [...prev, newsletterBroadcastAction] : prev),
  },
});

