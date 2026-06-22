import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public read of enabled feature flags as a { key: boolean } map. The website
 * and mobile app poll this to gate behaviour without a deploy. Only the boolean
 * state is exposed — never descriptions or internal fields.
 */
export async function GET() {
  let flags: { key: string; enabled: boolean }[] = [];
  try {
    flags = await prisma.featureFlag.findMany({ select: { key: true, enabled: true } });
  } catch {
    /* DB unreachable during build — return empty so callers fall back to defaults */
  }
  const map = Object.fromEntries(flags.map((f) => [f.key, f.enabled]));
  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
