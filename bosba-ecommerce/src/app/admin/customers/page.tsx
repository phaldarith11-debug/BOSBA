import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/utils";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, phone…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button type="submit" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Orders</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Total Spent</th>
              <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => {
              const totalSpent = c.orders.reduce((s, o) => s + Number(o.totalUsd), 0);
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{c._count.orders}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{formatUsd(totalSpent)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No customers found.</td>
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
