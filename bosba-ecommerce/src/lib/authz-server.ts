import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessArea, type DashboardArea } from "@/lib/authz";

/**
 * Server-side guard for a dashboard area. Returns the session if the current
 * user may access `area`, otherwise null. Mirrors the inline pattern used by
 * existing admin API routes (e.g. api/admin/settings/route.ts).
 */
export async function requireArea(area: DashboardArea) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !canAccessArea(role, area)) return null;
  return session;
}

/** Convenience: the current user's role (or undefined). */
export async function getSessionRole(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role;
}
