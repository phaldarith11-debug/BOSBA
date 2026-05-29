import { prisma } from "@/lib/prisma";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.length} total</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Value</th>
              <th className="px-4 py-3 font-medium text-gray-600">Min Order</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Used</th>
              <th className="px-4 py-3 font-medium text-gray-600">Expires</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => {
              const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
              const maxedOut = c.maxUsage !== null && c.usageCount >= c.maxUsage;
              const isActive = c.active && !expired && !maxedOut;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900 tracking-wide">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{c.discountType.replace("_", " ").toLowerCase()}</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    {c.discountType === "PERCENTAGE" ? `${Number(c.discountValue)}%` : `$${Number(c.discountValue).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.minOrderUsd ? `$${Number(c.minOrderUsd).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {c.usageCount}{c.maxUsage !== null ? ` / ${c.maxUsage}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" />
                        {!c.active ? "Disabled" : expired ? "Expired" : "Maxed"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/coupons/${c.id}/edit`} className="text-xs text-gray-400 hover:text-red-600">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No coupons yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
