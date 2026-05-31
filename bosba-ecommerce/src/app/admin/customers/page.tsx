import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Users, Search } from "lucide-react";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const q = searchParams.q ?? "";
  const take = 20;
  const skip = (page - 1) * take;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { role: "CUSTOMER" as const };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        _count: { select: { orders: true } },
        orders: { select: { totalUsd: true }, where: { paymentStatus: "PAID" } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Customers"
        description="View and manage your customer accounts"
        badge={total}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Customers" },
        ]}
        actions={
          <form className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, phone…"
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button type="submit" className="bg-gray-800 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-900 transition-colors">
              Search
            </button>
          </form>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Orders</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total Spent</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c) => {
              const totalSpent = c.orders.reduce((s, o) => s + Number(o.totalUsd), 0);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {c._count.orders}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">{formatUsd(totalSpent)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400">No customers found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                p === page ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-red-400"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
