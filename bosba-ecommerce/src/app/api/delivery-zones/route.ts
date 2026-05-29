import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    zones.map((z) => ({
      ...z,
      priceUsd:    Number(z.priceUsd),
      freeOverUsd: z.freeOverUsd ? Number(z.freeOverUsd) : null,
    }))
  );
}
