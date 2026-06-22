import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

/** Sales report: revenue + units grouped by month, plus top products. */
export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sid = seller.sellerId;

  const items = await prisma.orderItem.findMany({
    where: { product: { sellerId: sid }, order: { status: { not: "CANCELLED" } } },
    select: {
      totalUsd: true,
      quantity: true,
      nameEn: true,
      productId: true,
      order: { select: { createdAt: true } },
    },
  });

  const byMonth: Record<string, { revenue: number; units: number }> = {};
  const byProduct: Record<string, { name: string; revenue: number; units: number }> = {};

  for (const it of items) {
    const d = it.order?.createdAt ?? new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] ??= { revenue: 0, units: 0 };
    byMonth[key].revenue += Number(it.totalUsd);
    byMonth[key].units += it.quantity;

    byProduct[it.productId] ??= { name: it.nameEn, revenue: 0, units: 0 };
    byProduct[it.productId].revenue += Number(it.totalUsd);
    byProduct[it.productId].units += it.quantity;
  }

  const months = Object.entries(byMonth)
    .map(([month, v]) => ({ month, revenue: Number(v.revenue.toFixed(2)), units: v.units }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topProducts = Object.values(byProduct)
    .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const totalUnits = months.reduce((s, m) => s + m.units, 0);

  return NextResponse.json({
    months,
    topProducts,
    totalRevenueUsd: Number(totalRevenue.toFixed(2)),
    totalUnits,
  });
}
