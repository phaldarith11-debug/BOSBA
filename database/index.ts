// @bosba/database — single source of the Prisma client for the whole project.
//
// The schema lives in ./prisma/schema.prisma and the client is generated into the
// shared @prisma/client package (default output). This file exports a configured
// singleton (`prisma`) plus re-exports all Prisma types/enums, so apps import
// everything database-related from "@bosba/database".
//
// Env: DATABASE_URL must be present in the process env. The Next.js app loads it
// from bosba-ecommerce/.env automatically; CLI scripts load it via dotenv.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

const connectionString = process.env.DATABASE_URL;
const pool = globalForPrisma.pool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Re-export Prisma types/enums (Role, OrderStatus, Prisma, etc.)
export * from "@prisma/client";
