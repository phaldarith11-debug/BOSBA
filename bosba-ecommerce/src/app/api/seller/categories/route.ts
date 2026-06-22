import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

/** Category list for the seller product form (read-only). */
export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true, nameKm: true },
  });
  return NextResponse.json({ categories });
}
