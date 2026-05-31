import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/currency";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import { ManualPayConfirm } from "./ManualPayConfirm";
import { CSVExportButton } from "./CSVExportButton";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import type { Prisma } from "@prisma/client";

function PayBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

interface SearchParams {
  status?: string;
  payment?: string;
  q?: string;
  [key: string]: string | undefined;
}

const ORDER_STATUSES = [
  { key: "",            label: "All" },
  { key: "PENDING",     label: "Pending" },
  { key: "CONFIRMED",   label: "Confirmed" },
  { key: "PROCESSING",  label: "Processing" },
  { key: "SHIPPED",     label: "Shipped" },
  { key: "DELIVERED",   label: "Delivered" },
  { key: "CANCELLED",   label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const activeStatus = searchParams.status ?? "";

  // Build base filter (payment + search, not status — used for tab counts)
  const baseWhere: Prisma.OrderWhereInput = {};
  if (searchParams.payment) {
    baseWhere.paymentStatus = searchParams.payment as Prisma.OrderWhereInput["paymentStatus"];
  }
  if (searchParams.q) {
    baseWhere.orderNumber = { contains: searchParams.q, mode: "insensitive" };
  }

  const orderWhere: Prisma.OrderWhereInput = {
    ...baseWhere,
    ...(activeStatus
      ? { status: activeStatus as Prisma.OrderWhereInput["status"] }
      : {}),
  };

  // Run status tab counts + main order query in parallel
  const [statusCounts, orders] = await Promise.all([
    Promise.all(
      ORDER_STATUSES.map(({ key }) =>
        prisma.order.count({
          where: key
            ? { ...baseWhere, status: key as Prisma.OrderWhereInput["status"] }
            : baseWhere,
        })
      )
    ),
    prisma.order.findMany({
      where: orderWhere,
      include: { user: { select: { name: true, email: true } }, deliveryZone: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const tabCount = Object.fromEntries(
    ORDER_STATUSES.map(({ key }, i) => [key, statusCounts[i]])
  );

  function tabHref(key: string) {
    const p = new URLSearchParams();
    if (key) p.set("status", key);
    if (searchParams.q) p.set("q", searchParams.q);
    if (searchParams.payment) p.set("payment", searchParams.payment);
    const qs = p.toString();
    return `/admin/orders${qs ? "?" + qs : ""}`;
  }

  const PAY_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer orders</p>
        </div>
        <CSVExportButton />
      </div>

      {/* WooCommerce-style status tab bar */}
      <div className="flex items-center gap-0 border-b border-gray-200 overflow-x-auto">
        {ORDER_STATUSES.map(({ key, label }) => {
          const isActive = activeStatus === key;
          return (
            <Link
              key={key}
              href={tabHref(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {tabCount[key] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form className="flex flex-wrap gap-3 items-center">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search order number…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            name="payment"
            defaultValue={searchParams.payment ?? ""}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Payments</option>
            {PAY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-900 transition-colors"
          >
            Search
          </button>
          {(searchParams.payment || searchParams.q) && (
            <Link
              href={tabHref(activeStatus)}
              className="text-sm text-gray-400 hover:text-gray-600 underline py-2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or status tab</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Order #</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Zone</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-red-600">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-gray-900 hover:text-red-600 truncate max-w-[120px] block"
                        >
                          {order.user.name ?? "—"}
                        </Link>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {order.deliveryZone?.nameEn ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatUsd(Number(order.totalUsd))}</p>
                        <p className="text-xs text-gray-400">≈ ៛{order.totalKhr.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {order.paymentMethod.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <PayBadge status={order.paymentStatus} />
                          {order.paymentStatus === "PENDING" && order.paymentMethod !== "COD" && (
                            <ManualPayConfirm orderId={order.id} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-400">
              Showing {orders.length} of {tabCount[activeStatus] ?? 0} orders
              {activeStatus && (
                <span className="ml-1">with status <strong>{activeStatus}</strong></span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
