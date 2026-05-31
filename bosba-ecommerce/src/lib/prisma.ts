// The Prisma client now lives in the shared @bosba/database workspace package.
// This file re-exports it so existing `import { prisma } from "@/lib/prisma"`
// imports keep working unchanged.
export { prisma } from "@bosba/database";
