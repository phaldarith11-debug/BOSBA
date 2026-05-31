import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const position = new URL(req.url).searchParams.get("position") ?? "hero";
  const now = new Date();

  const banners = await prisma.banner.findMany({
    where: {
      position,
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      titleEn: true,
      titleKm: true,
      subtitleEn: true,
      subtitleKm: true,
      image: true,
      link: true,
      buttonText: true,
    },
  });

  return NextResponse.json(banners, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
