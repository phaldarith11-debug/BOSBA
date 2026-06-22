import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessArea, type DashboardArea } from "@/lib/authz";

/**
 * Server-side guard for a dashboard area. Returns the session if the current
 * user may access `area`, otherwise null. Mirrors the inline pattern used by
 * existing admin API routes (e.g. api/admin/settings/route.ts).
 */
export async function requireArea(area: DashboardArea) {
  // getServerSession can throw (e.g. missing NEXTAUTH_SECRET, JWT decode error).
  // Treat any failure as "not authorized" so the route degrades to the login
  // bounce instead of a server-side crash.
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("[authz] getServerSession failed:", err);
    return null;
  }
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !canAccessArea(role, area)) return null;
  return session;
}

/** Convenience: the current user's role (or undefined). */
export async function getSessionRole(): Promise<string | undefined> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { role?: string } | undefined)?.role;
  } catch (err) {
    console.error("[authz] getServerSession failed:", err);
    return undefined;
  }
}
