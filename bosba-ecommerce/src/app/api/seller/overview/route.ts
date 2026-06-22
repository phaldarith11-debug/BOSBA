import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sid = seller.sellerId;

  const [productCount, activeCount, lowStock, items, pendingPayout] = await Promise.all([
    prisma.product.count({ where: { sellerId: sid } }),
    prisma.product.count({ where: { sellerId: sid, active: true } }),
    prisma.product.count({ where: { sellerId: sid, stock: { lte: 5 } } }),
    prisma.orderItem.findMany({
      where: { product: { sellerId: sid } },
      select: { totalUsd: true, quantity: true, orderId: true, order: { select: { status: true } } },
    }),
    prisma.payout.aggregate({
      where: { sellerId: sid, status: "PENDING" },
      _sum: { amountUsd: true },
    }),
  ]);

  const revenue = items
    .filter((it) => it.order?.status !== "CANCELLED")
    .reduce((sum, it) => sum + Number(it.totalUsd), 0);
  const unitsSold = items.reduce((n, it) => n + it.quantity, 0);
  const orderIds = new Set(items.map((it) => it.orderId));

  return NextResponse.json({
    productCount,
    activeCount,
    lowStock,
    orderCount: orderIds.size,
    unitsSold,
    revenueUsd: Number(revenue.toFixed(2)),
    pendingPayoutUsd: Number(pendingPayout._sum.amountUsd ?? 0),
  });
}
