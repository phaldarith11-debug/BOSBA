import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/currency";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";

const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? 4100);

async function getStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalOrders, pendingOrders, totalCustomers, totalProducts, lowStockCount,
    todayRevenue, monthRevenue,
    recentOrders, last7Days,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, totalUsd: true },
    }),
  ]);

  // Build 7-day daily data
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of last7Days) {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day] += Number(o.totalUsd);
  }
  const weeklyData = Object.entries(dailyMap);

  return { totalOrders, pendingOrders, totalCustomers, totalProducts, lowStockCount, todayRevenue, monthRevenue, recentOrders, weeklyData };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100"}`}>{status}</span>
  );
}

export default async function AdminDashboard() {
  const s = await getStats();

  const todayUsd = Number(s.todayRevenue._sum.totalUsd ?? 0);
  const todayKhr = Math.round(todayUsd * KHR_RATE);
  const monthUsd = Number(s.monthRevenue._sum.totalUsd ?? 0);
  const monthKhr = Math.round(monthUsd * KHR_RATE);
  const maxWeekly = Math.max(...s.weeklyData.map(([, v]) => v), 0.01);

  const CARDS = [
    {
      label: "Today's Revenue",
      value: formatUsd(todayUsd),
      sub: `≈ ៛${todayKhr.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Monthly Revenue",
      value: formatUsd(monthUsd),
      sub: `≈ ៛${monthKhr.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-red-500",
    },
    {
      label: "Total Orders",
      value: s.totalOrders.toLocaleString(),
      sub: `${s.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Customers",
      value: s.totalCustomers.toLocaleString(),
      sub: `${s.totalProducts} active products`,
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString("en-US", { dateStyle: "full" })}</p>
      </div>

      {/* Low stock alert */}
      {s.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{s.lowStockCount} product{s.lowStockCount > 1 ? "s" : ""}</strong> have low stock (≤5 units).{" "}
            <Link href="/admin/products" className="underline hover:no-underline">Review →</Link>
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`${card.color} text-white p-2.5 rounded-xl inline-flex mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly revenue chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Revenue — Last 7 Days (USD)</h2>
        <div className="flex items-end gap-2 h-32">
          {s.weeklyData.map(([day, revenue]) => {
            const heightPct = Math.round((revenue / maxWeekly) * 100);
            const isToday = day === new Date().toISOString().slice(0, 10);
            const label = new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-xs font-medium text-gray-600 truncate">
                  {revenue > 0 ? `$${revenue.toFixed(0)}` : ""}
                </span>
                <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? "bg-red-600" : "bg-gray-200"}`}
                    style={{ height: `${Math.max(heightPct, revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? "text-red-600 font-semibold" : "text-gray-400"}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-red-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total USD</th>
                <th className="px-4 py-3 text-left">Total KHR</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {s.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-red-600">
                    <Link href={`/admin/orders/${order.id}`}>#{order.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{order.user.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatUsd(Number(order.totalUsd))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    ≈ ៛{Math.round(Number(order.totalUsd) * KHR_RATE).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.paymentMethod.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
