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

export async function GET() {
  const deny = await requireAdmin(); if (deny) return deny;
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(zones.map((z) => ({
    ...z,
    priceUsd:    Number(z.priceUsd),
    freeOverUsd: z.freeOverUsd ? Number(z.freeOverUsd) : null,
  })));
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(); if (deny) return deny;
  const data = await req.json();
  const zone = await prisma.deliveryZone.create({
    data: {
      nameEn:        data.nameEn,
      nameKm:        data.nameKm,
      priceUsd:      data.priceUsd,
      priceKhr:      data.priceKhr ?? Math.round(data.priceUsd * 4100),
      freeOverUsd:   data.freeOverUsd ?? null,
      estimatedDays: data.estimatedDays ?? 3,
      provinces:     data.provinces ?? [],
      sortOrder:     data.sortOrder ?? 99,
      active:        data.active ?? true,
    },
  });
  return NextResponse.json({ ...zone, priceUsd: Number(zone.priceUsd), freeOverUsd: zone.freeOverUsd ? Number(zone.freeOverUsd) : null }, { status: 201 });
}
