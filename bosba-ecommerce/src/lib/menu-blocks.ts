/**
 * PURE, client-safe menu primitives — no prisma/server imports. Shared by the
 * Developer "Menu Builder" (client), the server reader (@/lib/menus), the
 * validator, and the website nav. URLs reuse the same safeLink as the section
 * builder, so no unsafe links ever reach the DOM.
 */
import { safeLink } from "@/lib/cms-blocks";

export type MenuLocation = "header" | "footer" | "mobile_tabs";
export type Device = "web" | "mobile" | "both";
export type CmsStatus = "draft" | "published";

export const MENU_LOCATIONS: { location: MenuLocation; label: string; description: string }[] = [
  { location: "header", label: "Header Navigation", description: "Top navigation links on the website." },
  { location: "footer", label: "Footer Links", description: "Quick links shown in the website footer." },
  { location: "mobile_tabs", label: "Mobile Quick Links", description: "Shortcut links surfaced in the mobile app." },
];

export const MENU_LOCATION_VALUES: readonly MenuLocation[] = ["header", "footer", "mobile_tabs"] as const;
export const DEVICES: readonly Device[] = ["web", "mobile", "both"] as const;
export const STATUSES: readonly CmsStatus[] = ["draft", "published"] as const;

export interface MenuItemDTO {
  id: string;
  menuId: string;
  labelEn: string;
  labelKm: string | null;
  url: string;
  icon: string | null;
  device: Device;
  visible: boolean;
  status: CmsStatus;
  sortOrder: number;
}

export function isMenuLocation(v: unknown): v is MenuLocation {
  return typeof v === "string" && (MENU_LOCATION_VALUES as readonly string[]).includes(v);
}

/** Resolve an item's label for a given locale (EN/KM, EN fallback for ja/zh). */
export function menuLabel(item: { labelEn: string; labelKm: string | null }, locale: string): string {
  return (locale === "km" ? item.labelKm || item.labelEn : item.labelEn) ?? "";
}

export function toMenuItemDTO(row: {
  id: string;
  menuId: string;
  labelEn: string;
  labelKm: string | null;
  url: string;
  icon: string | null;
  device: string;
  visible: boolean;
  status: string;
  sortOrder: number;
}): MenuItemDTO {
  return {
    id: row.id,
    menuId: row.menuId,
    labelEn: row.labelEn,
    labelKm: row.labelKm,
    url: safeLink(row.url) ?? "/",
    icon: row.icon,
    device: (DEVICES as readonly string[]).includes(row.device) ? (row.device as Device) : "both",
    visible: row.visible,
    status: row.status === "published" ? "published" : "draft",
    sortOrder: row.sortOrder,
  };
}
