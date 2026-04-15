// Prisma types vary between versions; allow a defensive import to avoid
// TypeScript errors in environments with different @prisma/client exports.
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
  prismaPool?: Pool;
  prismaExitHookRegistered?: boolean;
};

const globalForPrisma = globalThis as PrismaGlobal;

if (!globalForPrisma.prisma) {
  // Keep the PostgreSQL pool and Prisma client singleton across Next.js HMR
  // reloads so repeated local edits do not leak connections.
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  globalForPrisma.prismaPool = pool;
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;

if (typeof window === "undefined" && !globalForPrisma.prismaExitHookRegistered) {
  globalForPrisma.prismaExitHookRegistered = true;
  process.on("exit", async () => {
    await globalForPrisma.prisma?.$disconnect();
    await globalForPrisma.prismaPool?.end();
  });
}
