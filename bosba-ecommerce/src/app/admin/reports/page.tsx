import { prisma } from "@/lib/prisma";
import { formatUsd, formatKhr } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

async function getReportData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonth, lastMonth, daily] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalUsd: true, totalKhr: true },
      _count: true,
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalUsd: true, totalKhr: true },
      _count: true,
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.$queryRaw<Array<{ day: Date; revenue: number; orders: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") as day,
             SUM("totalUsd")::float as revenue,
             COUNT(*) as orders
      FROM "Order"
      WHERE "createdAt" >= ${monthStart}
        AND status != 'CANCELLED'
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 30
    `,
  ]);

  return { thisMonth, lastMonth, daily };
}

export default async function ReportsPage() {
  const { thisMonth, lastMonth, daily } = await getReportData();

  const thisRevUsd = Number(thisMonth._sum.totalUsd ?? 0);
  const lastRevUsd = Number(lastMonth._sum.totalUsd ?? 0);
  const growth = lastRevUsd > 0 ? ((thisRevUsd - lastRevUsd) / lastRevUsd) * 100 : 0;

  return (
    <div>
      <AdminPageHeader
        title="Sales Reports"
        description="Revenue and order analytics for your store"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Sales Reports" },
        ]}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">This Month Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatUsd(thisRevUsd)}</p>
          <p className="text-xs text-gray-400">≈ ៛{Number(thisMonth._sum.totalKhr ?? 0).toLocaleString()}</p>
          <p className={`text-xs mt-2 font-medium ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {growth >= 0 ? "+" : ""}{growth.toFixed(1)}% vs last month
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">This Month Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonth._count}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Last Month Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatUsd(lastRevUsd)}</p>
          <p className="text-xs text-gray-400">{lastMonth._count} orders</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Daily Breakdown (This Month)</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Revenue (USD)</th>
                <th className="px-4 py-3 text-right">Revenue (KHR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {daily.map((row) => (
                <tr key={row.day.toString()} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(row.day).toLocaleDateString("en-US", { dateStyle: "medium" })}</td>
                  <td className="px-4 py-3 text-right">{Number(row.orders)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatUsd(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">≈ ៛{Math.round(row.revenue * 4100).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
