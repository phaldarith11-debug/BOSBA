import { prisma } from "@/lib/prisma";
import { toSectionDTO, type PageSectionDTO } from "@/lib/cms-blocks";

// Re-export the pure, client-safe primitives so server callers can import
// everything CMS-related from "@/lib/cms".
export * from "@/lib/cms-blocks";

/**
 * Published, visible sections for a page + surface, sorted. try/catch so that —
 * before the DB migration runs, or if the DB is unreachable during build —
 * callers simply get [] and the existing hardcoded UI shows instead of crashing.
 *
 * NOT wrapped in React cache(): this reader is also called from standalone Route
 * Handlers (/api/cms/sections), which run outside a per-request React scope where
 * cache() would memoize the result PROCESS-GLOBALLY and serve stale data until
 * redeploy. It is only called once per render here, so dedupe buys nothing.
 */
export async function getPublishedSections(
  page = "home",
  surface: "web" | "mobile" = "web"
): Promise<PageSectionDTO[]> {
  try {
    const rows = await prisma.pageSection.findMany({
      where: { page, status: "published", visible: true, device: { in: [surface, "both"] } },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toSectionDTO);
  } catch {
    return [];
  }
}
