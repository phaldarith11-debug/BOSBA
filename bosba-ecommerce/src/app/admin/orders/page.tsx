import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/currency";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import { ManualPayConfirm } from "./ManualPayConfirm";
import { CSVExportButton } from "./CSVExportButton";
import Link from "next/link";

function PayBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-600",
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

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.payment) where.paymentStatus = searchParams.payment;
  if (searchParams.q) {
    where.orderNumber = { contains: searchParams.q };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, deliveryZone: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const PAY_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">
          Orders <span className="text-lg font-normal text-gray-400">({orders.length})</span>
        </h1>
        <CSVExportButton />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <form className="flex flex-wrap gap-3 flex-1">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search order #…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-40"
          />
          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            name="payment"
            defaultValue={searchParams.payment ?? ""}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Payments</option>
            {PAY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            type="submit"
            className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            Filter
          </button>
          {(searchParams.status || searchParams.payment || searchParams.q) && (
            <a href="/admin/orders" className="text-sm text-gray-500 underline py-2">Clear</a>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Pay Status</th>
                <th className="px-4 py-3 text-left">Order Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No orders found</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-red-600">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[120px]">{order.user.name ?? "—"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.deliveryZone?.nameEn ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{formatUsd(Number(order.totalUsd))}</p>
                    <p className="text-xs text-gray-400">≈ ៛{order.totalKhr.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.paymentMethod.replace(/_/g, " ")}</td>
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
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
