import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30"; // days
  const days = Math.min(365, Math.max(1, parseInt(range, 10)));

  const since = new Date();
  since.setDate(since.getDate() - days);

  const [
    revenueAgg,
    orderCount,
    customerCount,
    topProducts,
    recentOrders,
    ordersByStatus,
    dailyRevenue,
  ] = await Promise.all([
    // Total revenue in range
    prisma.order.aggregate({
      _sum: { totalUsd: true, totalKhr: true },
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    }),
    // Order count in range
    prisma.order.count({
      where: { createdAt: { gte: since } },
    }),
    // New customers in range
    prisma.user.count({
      where: { createdAt: { gte: since }, role: "CUSTOMER" },
    }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId", "nameEn"],
      _sum: { quantity: true, totalUsd: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: { order: { createdAt: { gte: since }, status: { not: "CANCELLED" } } },
    }),
    // Recent 5 orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, orderNumber: true, status: true,
        paymentStatus: true, totalUsd: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    // Orders grouped by status
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: since } },
    }),
    // Daily revenue (last 30 days max for chart)
    prisma.$queryRaw<Array<{ day: string; revenue: number; orders: bigint }>>`
      SELECT TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') as day,
             SUM("totalUsd")::float as revenue,
             COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= ${since}
        AND status != 'CANCELLED'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY DATE_TRUNC('day', "createdAt") ASC
      LIMIT 30
    `,
  ]);

  return NextResponse.json({
    summary: {
      revenueUsd: Number(revenueAgg._sum.totalUsd ?? 0),
      revenueKhr: Number(revenueAgg._sum.totalKhr ?? 0),
      orderCount,
      customerCount,
      avgOrderValueUsd: orderCount > 0
        ? Number(revenueAgg._sum.totalUsd ?? 0) / orderCount
        : 0,
    },
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      nameEn: p.nameEn,
      unitsSold: Number(p._sum.quantity ?? 0),
      revenueUsd: Number(p._sum.totalUsd ?? 0),
    })),
    recentOrders,
    ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s.status, s._count])),
    dailyRevenue: dailyRevenue.map((r) => ({
      day: r.day,
      revenue: r.revenue,
      orders: Number(r.orders),
    })),
    range: days,
  });
}
