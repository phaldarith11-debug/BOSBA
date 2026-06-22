import { NextRequest, NextResponse } from "next/server";
import { getPublishedSections } from "@/lib/cms";

/**
 * Public, read-only CMS feed. Returns the PUBLISHED + visible layout blocks for
 * a page, filtered to the requesting surface. Both the website and the mobile
 * app read this so a single dashboard edit updates both.
 *
 *   GET /api/cms/sections?page=home&device=web
 *   GET /api/cms/sections?page=home&device=mobile
 *
 * Drafts are never returned here — they only exist inside the Developer console.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = (searchParams.get("page") || "home").slice(0, 60);
  const device = searchParams.get("device") === "mobile" ? "mobile" : "web";

  const sections = await getPublishedSections(page, device);

  return NextResponse.json(
    { page, device, sections },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
