import { prisma } from "@/lib/prisma";
import { toMenuItemDTO, type MenuItemDTO, type MenuLocation } from "@/lib/menu-blocks";

export * from "@/lib/menu-blocks";

/**
 * Published, visible items for a menu location + surface, sorted. try/catch so
 * that — before the migration runs or if the DB is unreachable during build —
 * callers get [] and the existing hardcoded nav renders instead of crashing.
 *
 * NOT wrapped in React cache() — see the note in @/lib/cms getPublishedSections:
 * it is also called from the /api/cms/menus Route Handler, where cache() would
 * memoize process-globally and serve stale nav until redeploy.
 */
export async function getPublishedMenu(
  location: MenuLocation,
  surface: "web" | "mobile" = "web"
): Promise<MenuItemDTO[]> {
  try {
    const menu = await prisma.menu.findUnique({
      where: { location },
      include: {
        items: {
          where: { status: "published", visible: true, device: { in: [surface, "both"] } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return (menu?.items ?? []).map(toMenuItemDTO);
  } catch {
    return [];
  }
}
