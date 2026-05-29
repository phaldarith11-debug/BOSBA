import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Bell, Package, ShoppingCart, Users } from "lucide-react";

async function getData() {
  const [pendingOrders, lowStock, newCustomers, recentNotifs] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PENDING" },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 20,
      select: { id: true, nameEn: true, stock: true, sku: true },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  return { pendingOrders, lowStock, newCustomers, recentNotifs };
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!["ADMIN", "MANAGER"].includes(role ?? "")) {
    return <p className="text-gray-500 p-6">Access denied.</p>;
  }

  const { pendingOrders, lowStock, newCustomers, recentNotifs } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-0.5">System alerts and recent activity overview</p>
      </div>

      {/* Alert cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 ${pendingOrders.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-white shadow-sm"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${pendingOrders.length > 0 ? "bg-amber-500" : "bg-gray-200"} text-white`}>
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              <p className="text-xs text-gray-500">Pending Orders</p>
            </div>
          </div>
          {pendingOrders.length > 0 && (
            <a href="/admin/orders?status=PENDING" className="text-xs text-amber-700 font-semibold hover:underline">
              Review pending orders →
            </a>
          )}
        </div>

        <div className={`rounded-2xl p-5 ${lowStock.length > 0 ? "bg-red-50 border border-red-200" : "bg-white shadow-sm"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${lowStock.length > 0 ? "bg-red-500" : "bg-gray-200"} text-white`}>
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
              <p className="text-xs text-gray-500">Low Stock Products</p>
            </div>
          </div>
          {lowStock.length > 0 && (
            <a href="/admin/products" className="text-xs text-red-700 font-semibold hover:underline">
              Review stock levels →
            </a>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{newCustomers}</p>
              <p className="text-xs text-gray-500">New Customers (7 days)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock list */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-red-500" />
              Low Stock Alert
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nameEn}</p>
                  {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                </div>
                <span className={`text-sm font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                  {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent customer notifications */}
      {recentNotifs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              Recent Customer Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNotifs.map((n) => (
              <div key={n.id} className="flex items-start gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.titleEn}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize flex-shrink-0">{n.type}</span>
                  </div>
                  {n.bodyEn && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.bodyEn}</p>}
                  <p className="text-xs text-gray-400 mt-1">{n.user.name ?? n.user.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.readAt ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Read</span>
                  ) : (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
