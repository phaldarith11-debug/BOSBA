import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Re-export the pure registry so existing server imports keep working.
export * from "@/lib/setting-registry";

/** Read every settings row as a key→value map (cached per request). */
export const getSettingsMap = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await prisma.settings.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
});

/** Whether the storefront is in maintenance mode. */
export const isMaintenanceMode = cache(async (): Promise<boolean> => {
  const map = await getSettingsMap();
  return map.maintenance_mode === "true";
});
