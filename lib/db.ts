import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __tg_prisma: PrismaClient | undefined;
}

export function getDb() {
  if (!process.env.DATABASE_URL) return null;

  if (!global.__tg_prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    global.__tg_prisma = new PrismaClient({ adapter });
  }

  return global.__tg_prisma;
}

