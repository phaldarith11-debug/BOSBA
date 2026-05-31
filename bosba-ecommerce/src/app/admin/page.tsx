import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/currency";
import {
  Package, ShoppingCart, Users, TrendingUp, DollarSign,
  AlertTriangle, Plus, Tag, BarChart2, Settings, Megaphone, Clock,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? 4100);

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    processingOrders,
    shippedOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    todayRevenue,
    monthRevenue,
    lastMonthRevenue,
    recentOrders,
    last7Days,
    topItems,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
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
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: {
        createdAt: { gte: lastMonthStart, lt: monthStart },
        status: { not: "CANCELLED" },
      },
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
    prisma.orderItem.groupBy({
      by: ["productId", "nameEn"],
      _sum: { quantity: true, totalUsd: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Fetch product images for top sellers
  const topIds = topItems.map((i) => i.productId);
  const topProductData = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, images: true, slug: true },
      })
    : [];
  const imageMap = Object.fromEntries(topProductData.map((p) => [p.id, p.images[0] ?? null]));
  const slugMap = Object.fromEntries(topProductData.map((p) => [p.id, p.slug]));

  const topProducts = topItems.map((item) => ({
    productId: item.productId,
    nameEn: item.nameEn,
    qty: item._sum.quantity ?? 0,
    revenue: Number(item._sum.totalUsd ?? 0),
    imageUrl: imageMap[item.productId] ?? null,
    slug: slugMap[item.productId] ?? "",
  }));

  // Build 7-day bar chart data
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

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    todayRevenue,
    monthRevenue,
    lastMonthRevenue,
    recentOrders,
    weeklyData,
    topProducts,
    processingOrders,
    shippedOrders,
    cancelledOrders,
  };
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100"}`}>
      {status}
    </span>
  );
}

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products/new", icon: Plus, color: "bg-blue-500" },
  { label: "Pending Orders", href: "/admin/orders?status=PENDING", icon: Clock, color: "bg-amber-500" },
  { label: "New Coupon", href: "/admin/coupons/new", icon: Tag, color: "bg-green-500" },
  { label: "Sales Report", href: "/admin/reports", icon: BarChart2, color: "bg-purple-500" },
  { label: "New Banner", href: "/admin/banners/new", icon: Megaphone, color: "bg-pink-500" },
  { label: "Settings", href: "/admin/settings", icon: Settings, color: "bg-gray-500" },
];

export default async function AdminDashboard() {
  const s = await getStats();

  const todayUsd = Number(s.todayRevenue._sum.totalUsd ?? 0);
  const monthUsd = Number(s.monthRevenue._sum.totalUsd ?? 0);
  const lastMonthUsd = Number(s.lastMonthRevenue._sum.totalUsd ?? 0);
  const maxWeekly = Math.max(...s.weeklyData.map(([, v]) => v), 0.01);

  const monthChange =
    lastMonthUsd > 0 ? Math.round(((monthUsd - lastMonthUsd) / lastMonthUsd) * 100) : null;

  const STAT_CARDS = [
    {
      label: "Today's Revenue",
      value: formatUsd(todayUsd),
      sub: `≈ ៛${Math.round(todayUsd * KHR_RATE).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
      href: "/admin/reports",
    },
    {
      label: "Monthly Revenue",
      value: formatUsd(monthUsd),
      sub: monthChange !== null
        ? `${monthChange >= 0 ? "+" : ""}${monthChange}% vs last month`
        : `≈ ៛${Math.round(monthUsd * KHR_RATE).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-red-500",
      href: "/admin/reports",
    },
    {
      label: "Total Orders",
      value: s.totalOrders.toLocaleString(),
      sub: `${s.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "bg-blue-500",
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: s.pendingOrders.toLocaleString(),
      sub: "Needs attention",
      icon: Clock,
      color: "bg-amber-500",
      href: "/admin/orders?status=PENDING",
    },
    {
      label: "Customers",
      value: s.totalCustomers.toLocaleString(),
      sub: `${s.completedOrders} delivered orders`,
      icon: Users,
      color: "bg-purple-500",
      href: "/admin/customers",
    },
    {
      label: "Active Products",
      value: s.totalProducts.toLocaleString(),
      sub: s.lowStockCount > 0 ? `${s.lowStockCount} low stock` : "All stocked",
      icon: Package,
      color: "bg-indigo-500",
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
        </p>
      </div>

      {/* Low stock alert */}
      {s.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{s.lowStockCount} product{s.lowStockCount > 1 ? "s" : ""}</strong> low stock (≤5
            units).{" "}
            <Link href="/admin/products?status=low_stock" className="underline hover:no-underline font-medium">
              Review now →
            </Link>
          </p>
        </div>
      )}

      {/* 6 Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className={`${card.color} text-white p-2 rounded-lg inline-flex mb-3`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              {card.value}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-tight">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Revenue — Last 7 Days</h2>
            <span className="text-xs text-gray-400">USD</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: "140px" }}>
            {s.weeklyData.map(([day, revenue]) => {
              const heightPct = Math.round((revenue / maxWeekly) * 100);
              const isToday = day === new Date().toISOString().slice(0, 10);
              const label = new Date(day + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">
                    {revenue > 0 ? `$${revenue.toFixed(0)}` : ""}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday ? "bg-red-500" : "bg-blue-100 hover:bg-blue-200"
                      }`}
                      style={{ height: `${Math.max(heightPct, revenue > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] ${
                      isToday ? "text-red-600 font-bold" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-400">
            <span>Monthly revenue: <strong className="text-gray-700">{formatUsd(monthUsd)}</strong></span>
            {monthChange !== null && (
              <span className={monthChange >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {monthChange >= 0 ? "+" : ""}{monthChange}% vs last month
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center group"
              >
                <div className={`${color} text-white p-2 rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Best Sellers */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-red-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Order</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Total</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {s.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-red-600">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 truncate max-w-[100px]">
                      {order.user.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs">{formatUsd(Number(order.totalUsd))}</p>
                      <p className="text-[10px] text-gray-400">
                        ≈ ៛{Math.round(Number(order.totalUsd) * KHR_RATE).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {s.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Best Sellers</h2>
            <Link href="/admin/products" className="text-sm text-red-600 hover:underline font-medium">
              All products →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {s.topProducts.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No sales data yet</div>
            ) : (
              s.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {product.imageUrl ? (
                      <NextImage
                        src={product.imageUrl}
                        alt={product.nameEn}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products?q=${encodeURIComponent(product.nameEn)}`}
                      className="text-sm font-medium text-gray-800 hover:text-red-600 transition-colors truncate block"
                    >
                      {product.nameEn}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {product.qty} sold · {formatUsd(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {s.topProducts.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t">
              <Link
                href="/admin/reports"
                className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1"
              >
                <BarChart2 className="h-3 w-3" />
                Full sales report
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Completed orders summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Delivered", count: s.completedOrders, href: "/admin/orders?status=DELIVERED", color: "text-green-600 bg-green-50 border-green-100" },
          { label: "Processing", count: s.processingOrders, href: "/admin/orders?status=PROCESSING", color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Shipped", count: s.shippedOrders, href: "/admin/orders?status=SHIPPED", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Cancelled", count: s.cancelledOrders, href: "/admin/orders?status=CANCELLED", color: "text-red-600 bg-red-50 border-red-100" },
        ].map(({ label, count, href, color }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color} hover:opacity-80 transition-opacity`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-lg font-bold">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
