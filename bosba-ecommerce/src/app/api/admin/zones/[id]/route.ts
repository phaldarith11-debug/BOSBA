import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const data = await req.json();

  const zone = await prisma.deliveryZone.update({
    where: { id: params.id },
    data: {
      nameEn:        data.nameEn,
      nameKm:        data.nameKm,
      priceUsd:      data.priceUsd,
      priceKhr:      data.priceKhr ?? Math.round(Number(data.priceUsd) * 4100),
      freeOverUsd:   data.freeOverUsd ?? null,
      estimatedDays: data.estimatedDays,
      provinces:     data.provinces,
      sortOrder:     data.sortOrder,
      active:        data.active,
    },
  });
  return NextResponse.json({ ...zone, priceUsd: Number(zone.priceUsd), freeOverUsd: zone.freeOverUsd ? Number(zone.freeOverUsd) : null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const deny = await requireAdmin(); if (deny) return deny;
  await prisma.deliveryZone.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
