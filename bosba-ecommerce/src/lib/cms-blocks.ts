/**
 * PURE, client-safe CMS primitives — no prisma / server imports. Shared by the
 * Developer "Homepage Builder" (client), the server reader (@/lib/cms), the
 * validator (@/lib/cms-validate), and the website renderer.
 *
 * SAFETY: a fixed library of section types — no arbitrary HTML/code is ever
 * stored or rendered. Colors and links are validated before reaching the DOM.
 */

export type SectionType =
  | "hero"
  | "promo_banner"
  | "text"
  | "image"
  | "category_grid"
  | "product_carousel"
  | "faq"
  | "testimonials";

export type Device = "web" | "mobile" | "both";
export type CmsStatus = "draft" | "published";
export type SectionField = "title" | "subtitle" | "image" | "button" | "colors";

export const SECTION_TYPES: readonly SectionType[] = [
  "hero",
  "promo_banner",
  "text",
  "image",
  "category_grid",
  "product_carousel",
  "faq",
  "testimonials",
] as const;

export const DEVICES: readonly Device[] = ["web", "mobile", "both"] as const;
export const STATUSES: readonly CmsStatus[] = ["draft", "published"] as const;

/** Builder metadata: label + which fields each block type actually uses. */
export const SECTION_LIBRARY: Record<
  SectionType,
  { label: string; description: string; fields: SectionField[] }
> = {
  hero: {
    label: "Hero Banner",
    description: "Large headline area with subtitle and a call-to-action button.",
    fields: ["title", "subtitle", "image", "button", "colors"],
  },
  promo_banner: {
    label: "Promo Banner",
    description: "Rounded promotional card with a heading and button.",
    fields: ["title", "subtitle", "image", "button", "colors"],
  },
  text: {
    label: "Text Section",
    description: "A centered heading and paragraph of text.",
    fields: ["title", "subtitle", "colors"],
  },
  image: {
    label: "Image / Banner",
    description: "A responsive full-width image, optionally clickable.",
    fields: ["image", "button"],
  },
  category_grid: {
    label: "Category Grid",
    description: "Heading above a category showcase.",
    fields: ["title", "subtitle", "image", "button"],
  },
  product_carousel: {
    label: "Product Carousel",
    description: "Heading + button that links to a product listing.",
    fields: ["title", "subtitle", "image", "button"],
  },
  faq: {
    label: "FAQ Section",
    description: "Heading and a list of question/answer items.",
    fields: ["title", "subtitle", "image", "button"],
  },
  testimonials: {
    label: "Testimonials",
    description: "Heading and customer quotes.",
    fields: ["title", "subtitle", "image", "button"],
  },
};

export interface PageSectionDTO {
  id: string;
  page: string;
  type: SectionType;
  titleEn: string | null;
  titleKm: string | null;
  subtitleEn: string | null;
  subtitleKm: string | null;
  image: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  bgColor: string | null;
  textColor: string | null;
  config: Record<string, unknown> | null;
  device: Device;
  visible: boolean;
  status: CmsStatus;
  sortOrder: number;
}

/** Accept only safe CSS color values (hex / rgb() / hsl()). */
export function safeColor(v?: string | null): string | null {
  if (!v) return null;
  const s = v.trim();
  return /^#[0-9a-fA-F]{3,8}$|^(rgb|hsl)a?\([\d.,%\s/]+\)$/.test(s) ? s : null;
}

/** Accept only internal ("/...") or absolute http(s) links — never javascript: etc. */
export function safeLink(v?: string | null): string | null {
  if (!v) return null;
  const s = v.trim();
  if (s.startsWith("/")) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return null;
}

export function isSectionType(v: unknown): v is SectionType {
  return typeof v === "string" && (SECTION_TYPES as readonly string[]).includes(v);
}

/** Shape a raw row into a sanitized, typed DTO for any consumer. */
export function toSectionDTO(row: {
  id: string;
  page: string;
  type: string;
  titleEn: string | null;
  titleKm: string | null;
  subtitleEn: string | null;
  subtitleKm: string | null;
  image: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  bgColor: string | null;
  textColor: string | null;
  config: unknown;
  device: string;
  visible: boolean;
  status: string;
  sortOrder: number;
}): PageSectionDTO {
  return {
    id: row.id,
    page: row.page,
    type: isSectionType(row.type) ? row.type : "text",
    titleEn: row.titleEn,
    titleKm: row.titleKm,
    subtitleEn: row.subtitleEn,
    subtitleKm: row.subtitleKm,
    image: row.image,
    buttonText: row.buttonText,
    buttonLink: safeLink(row.buttonLink),
    bgColor: safeColor(row.bgColor),
    textColor: safeColor(row.textColor),
    config:
      row.config && typeof row.config === "object"
        ? (row.config as Record<string, unknown>)
        : null,
    device: (DEVICES as readonly string[]).includes(row.device)
      ? (row.device as Device)
      : "both",
    visible: row.visible,
    status: row.status === "published" ? "published" : "draft",
    sortOrder: row.sortOrder,
  };
}
