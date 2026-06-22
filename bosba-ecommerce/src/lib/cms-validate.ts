import {
  DEVICES,
  STATUSES,
  isSectionType,
  safeColor,
  safeLink,
  type Device,
  type CmsStatus,
} from "@/lib/cms-blocks";

/** Trim + hard length cap so a single field can never bloat the row. */
function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

export interface SectionWriteData {
  page?: string;
  type?: string;
  titleEn?: string | null;
  titleKm?: string | null;
  subtitleEn?: string | null;
  subtitleKm?: string | null;
  image?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  config?: object | null;
  device?: Device;
  visible?: boolean;
  status?: CmsStatus;
  sortOrder?: number;
}

/**
 * Validate + sanitize untrusted input from the Developer console into a safe
 * Prisma write object. Unknown keys are dropped. With `partial: true` only the
 * provided keys are returned (for PATCH). Invalid colors/links collapse to null
 * rather than reaching the DOM.
 */
export function sanitizeSectionInput(
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
): SectionWriteData {
  const out: SectionWriteData = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("page")) out.page = str(body.page, 60) ?? "home";

  if (!partial || has("type")) {
    out.type = isSectionType(body.type) ? body.type : "text";
  }

  if (has("titleEn")) out.titleEn = str(body.titleEn, 300);
  if (has("titleKm")) out.titleKm = str(body.titleKm, 300);
  if (has("subtitleEn")) out.subtitleEn = str(body.subtitleEn, 2000);
  if (has("subtitleKm")) out.subtitleKm = str(body.subtitleKm, 2000);
  if (has("image")) out.image = str(body.image, 600);
  if (has("buttonText")) out.buttonText = str(body.buttonText, 120);
  if (has("buttonLink")) out.buttonLink = safeLink(str(body.buttonLink, 600));
  if (has("bgColor")) out.bgColor = safeColor(str(body.bgColor, 60));
  if (has("textColor")) out.textColor = safeColor(str(body.textColor, 60));

  if (has("config")) {
    out.config =
      body.config && typeof body.config === "object" && !Array.isArray(body.config)
        ? (body.config as object)
        : null;
  }

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

  return out;
}
