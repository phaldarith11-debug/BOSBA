import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isStaff(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "MANAGER" || role === "EDITOR";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      titleEn: body.titleEn,
      titleKm: body.titleKm ?? "",
      titleJa: body.titleJa ?? "",
      titleZh: body.titleZh ?? "",
      subtitleEn: body.subtitleEn || null,
      subtitleKm: body.subtitleKm || null,
      subtitleJa: body.subtitleJa || null,
      subtitleZh: body.subtitleZh || null,
      image: body.image,
      link: body.link || null,
      buttonText: body.buttonText || null,
      position: body.position ?? "hero",
      sortOrder: body.sortOrder ? parseInt(body.sortOrder) : 0,
      active: body.active !== false,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}

