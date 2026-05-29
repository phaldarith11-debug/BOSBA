import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isStaff(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "MANAGER" || role === "EDITOR";
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const banner = await prisma.banner.findUnique({ where: { id: params.id } });
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const banner = await prisma.banner.update({
    where: { id: params.id },
    data: {
      ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
      ...(body.titleKm !== undefined && { titleKm: body.titleKm }),
      ...(body.titleJa !== undefined && { titleJa: body.titleJa }),
      ...(body.titleZh !== undefined && { titleZh: body.titleZh }),
      ...(body.subtitleEn !== undefined && { subtitleEn: body.subtitleEn || null }),
      ...(body.subtitleKm !== undefined && { subtitleKm: body.subtitleKm || null }),
      ...(body.subtitleJa !== undefined && { subtitleJa: body.subtitleJa || null }),
      ...(body.subtitleZh !== undefined && { subtitleZh: body.subtitleZh || null }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.link !== undefined && { link: body.link || null }),
      ...(body.buttonText !== undefined && { buttonText: body.buttonText || null }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.sortOrder !== undefined && { sortOrder: parseInt(body.sortOrder) }),
      ...(body.active !== undefined && { active: body.active }),
      ...(body.startsAt !== undefined && { startsAt: body.startsAt ? new Date(body.startsAt) : null }),
      ...(body.endsAt !== undefined && { endsAt: body.endsAt ? new Date(body.endsAt) : null }),
    },
  });
  return NextResponse.json(banner);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
