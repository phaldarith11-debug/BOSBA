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
  | "DEVELOPER"
  | "OWNER"
  | "STAFF"
  | "VIEWER";

export type DashboardArea = "admin" | "seller" | "developer";

/**
 * Which roles may enter each dashboard area.
 * - OWNER / ADMIN are super-roles that can reach every area.
 * - VIEWER and STAFF get read-only / limited admin access.
 */
export const AREA_ROLES: Record<DashboardArea, Role[]> = {
  admin: ["OWNER", "ADMIN", "MANAGER", "EDITOR", "STAFF", "VIEWER"],
  seller: ["SELLER", "OWNER", "ADMIN"],
  developer: ["DEVELOPER", "OWNER", "ADMIN"],
};

/** Login page for each area (used for redirects on unauthorized access). */
export const AREA_LOGIN_PATHS: Record<DashboardArea, string> = {
  admin: "/admin/login",
  seller: "/seller/login",
  developer: "/developer/login",
};

/** Roles an ADMIN/OWNER may assign from the user management screen. */
export const ASSIGNABLE_ROLES: Role[] = [
  "VIEWER",
  "STAFF",
  "EDITOR",
  "MANAGER",
  "SELLER",
  "DEVELOPER",
  "ADMIN",
  "OWNER",
];

/** Roles that appear in the user management list (everyone with elevated access). */
export const STAFF_ROLES: Role[] = [
  "VIEWER",
  "STAFF",
  "EDITOR",
  "MANAGER",
  "SELLER",
  "DEVELOPER",
  "ADMIN",
  "OWNER",
];

/** Super-roles that can do everything in every area. */
export const SUPER_ROLES: Role[] = ["OWNER", "ADMIN"];

/** Roles that may only read (no create/update/delete) inside the admin area. */
export const READ_ONLY_ROLES: Role[] = ["VIEWER"];

/** Path prefixes guarded by each area, in middleware match order. */
export const DASHBOARD_AREAS: { area: DashboardArea; prefix: string }[] = [
  { area: "admin", prefix: "/admin" },
  { area: "seller", prefix: "/seller" },
  { area: "developer", prefix: "/developer" },
];

export function isSuperRole(role: string | null | undefined): boolean {
  return !!role && (SUPER_ROLES as string[]).includes(role);
}

export function isReadOnly(role: string | null | undefined): boolean {
  return !!role && (READ_ONLY_ROLES as string[]).includes(role);
}

export function canAccessArea(
  role: string | null | undefined,
  area: DashboardArea
): boolean {
  if (!role) return false;
  return (AREA_ROLES[area] as string[]).includes(role);
}

/**
 * Whether the role may perform a *write* (mutating) action in the given area.
 * VIEWER is read-only everywhere; STAFF is limited but can write in admin.
 */
export function canWriteArea(
  role: string | null | undefined,
  area: DashboardArea
): boolean {
  if (!canAccessArea(role, area)) return false;
  if (isReadOnly(role)) return false;
  return true;
}

/** Where a user should land after signing in, based on their role. */
export function homeForRole(role: string | null | undefined): string {
  switch (role) {
    case "OWNER":
    case "ADMIN":
    case "MANAGER":
    case "EDITOR":
    case "STAFF":
    case "VIEWER":
      return "/admin";
    case "SELLER":
      return "/seller";
    case "DEVELOPER":
      return "/developer";
    default:
      return "/";
  }
}
