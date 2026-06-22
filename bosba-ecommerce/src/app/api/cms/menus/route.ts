import { NextRequest, NextResponse } from "next/server";
import { getPublishedMenu } from "@/lib/menus";
import { isMenuLocation } from "@/lib/menu-blocks";

/**
 * Public, read-only navigation feed. Returns the PUBLISHED + visible items for a
 * menu location, filtered to the requesting surface. Website and mobile both
 * read this so a single dashboard edit updates both navs.
 *
 *   GET /api/cms/menus?location=header&device=web
 *   GET /api/cms/menus?location=mobile_tabs&device=mobile
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "header";
  const device = searchParams.get("device") === "mobile" ? "mobile" : "web";

  if (!isMenuLocation(location)) {
    return NextResponse.json({ error: "Unknown location" }, { status: 400 });
  }

  const items = await getPublishedMenu(location, device);

  return NextResponse.json(
    { location, device, items },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
