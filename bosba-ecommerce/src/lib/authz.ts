/**
 * Shared authorization primitives for the three dashboard areas.
 *
 * This file is PURE (no server-only imports) so it is safe to import from the
 * edge middleware. Server-side session helpers live in `authz-server.ts`.
 */

export type Role =
  | "CUSTOMER"
  | "SELLER"
  | "EDITOR"
  | "MANAGER"
  | "ADMIN"
  | "DEVELOPER";

export type DashboardArea = "admin" | "seller" | "developer";

/** Which roles may enter each dashboard area. ADMIN can reach all areas. */
export const AREA_ROLES: Record<DashboardArea, Role[]> = {
  admin: ["ADMIN", "MANAGER", "EDITOR"],
  seller: ["SELLER", "ADMIN"],
  developer: ["DEVELOPER", "ADMIN"],
};

/** Login page for each area (used for redirects on unauthorized access). */
export const AREA_LOGIN_PATHS: Record<DashboardArea, string> = {
  admin: "/admin/login",
  seller: "/seller/login",
  developer: "/developer/login",
};

/** Roles an ADMIN may assign from the Staff & Roles screen. */
export const ASSIGNABLE_ROLES: Role[] = [
  "EDITOR",
  "MANAGER",
  "ADMIN",
  "SELLER",
  "DEVELOPER",
];

/** Roles that appear in the Staff & Roles list (everyone with elevated access). */
export const STAFF_ROLES: Role[] = [
  "EDITOR",
  "MANAGER",
  "ADMIN",
  "SELLER",
  "DEVELOPER",
];

/** Path prefixes guarded by each area, in middleware match order. */
export const DASHBOARD_AREAS: { area: DashboardArea; prefix: string }[] = [
  { area: "admin", prefix: "/admin" },
  { area: "seller", prefix: "/seller" },
  { area: "developer", prefix: "/developer" },
];

export function canAccessArea(
  role: string | null | undefined,
  area: DashboardArea
): boolean {
  if (!role) return false;
  return (AREA_ROLES[area] as string[]).includes(role);
}

/** Where a user should land after signing in, based on their role. */
export function homeForRole(role: string | null | undefined): string {
  switch (role) {
    case "ADMIN":
    case "MANAGER":
    case "EDITOR":
      return "/admin";
    case "SELLER":
      return "/seller";
    case "DEVELOPER":
      return "/developer";
    default:
      return "/";
  }
}
