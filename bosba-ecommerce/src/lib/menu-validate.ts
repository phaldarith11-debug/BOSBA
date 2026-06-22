import { safeLink } from "@/lib/cms-blocks";
import { DEVICES, STATUSES, type Device, type CmsStatus } from "@/lib/menu-blocks";

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

export interface MenuItemWriteData {
  labelEn?: string | null;
  labelKm?: string | null;
  url?: string | null;
  icon?: string | null;
  device?: Device;
  visible?: boolean;
  status?: CmsStatus;
  sortOrder?: number;
}

/**
 * Validate + sanitize untrusted Menu Builder input. Unknown keys dropped. With
 * `partial: true` only provided keys are returned (PATCH). Invalid links/icons
 * collapse to null.
 */
export function sanitizeMenuItemInput(
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
): MenuItemWriteData {
  const out: MenuItemWriteData = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  if (has("labelEn")) out.labelEn = str(body.labelEn, 120);
  if (has("labelKm")) out.labelKm = str(body.labelKm, 120);
  if (has("url")) out.url = safeLink(str(body.url, 600));
  if (has("icon")) out.icon = str(body.icon, 60);

  if (has("device")) {
    out.device = (DEVICES as readonly string[]).includes(body.device as string)
      ? (body.device as Device)
      : "both";
  }
  if (has("visible")) out.visible = Boolean(body.visible);
  if (has("status")) {
    out.status = (STATUSES as readonly string[]).includes(body.status as string)
      ? (body.status as CmsStatus)
      : "draft";
  }
  if (has("sortOrder")) {
    const n = Number(body.sortOrder);
    out.sortOrder = Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  // A required, non-empty label is needed to create a usable item.
  if (!partial && !out.labelEn) out.labelEn = "Untitled";
  if (!partial && !out.url) out.url = "/";

  return out;
}
