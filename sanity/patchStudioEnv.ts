/**
 * Runs before other Studio modules load (import first from `sanity.config.ts`).
 *
 * Sanity only inlines `SANITY_STUDIO_*` into the browser bundle — `NEXT_PUBLIC_*`
 * from `.env` is often not on `process.env` when the CLI runs, so we read `.env`
 * from disk and mirror the site URL into `SANITY_STUDIO_APP_ORIGIN`.
 */
import fs from "node:fs";
import path from "node:path";

function parseDotEnv(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadRootEnv(): Record<string, string> {
  const root = process.cwd();
  const a = parseDotEnv(path.join(root, ".env"));
  const b = parseDotEnv(path.join(root, ".env.local"));
  return { ...a, ...b };
}

const fileEnv = loadRootEnv();

function pickSiteOrigin(): string | undefined {
  const fromProcess =
    process.env.SANITY_STUDIO_APP_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromProcess) return fromProcess.replace(/\/$/, "");

  const fromFile =
    fileEnv.SANITY_STUDIO_APP_ORIGIN?.trim() || fileEnv.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromFile) return fromFile.replace(/\/$/, "");

  return undefined;
}

const origin = pickSiteOrigin();
if (origin && !process.env.SANITY_STUDIO_APP_ORIGIN?.trim()) {
  process.env.SANITY_STUDIO_APP_ORIGIN = origin;
}
