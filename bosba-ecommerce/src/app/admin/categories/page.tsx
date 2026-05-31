import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Layers } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize your products into categories"
        badge={categories.length}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories" },
        ]}
        actions={
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name (EN)</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name (KM)</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Products</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/admin/categories/${cat.id}/edit`} className="hover:text-red-600 transition-colors">
                    {cat.nameEn}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{cat.nameKm}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {cat._count.products}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/categories/${cat.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Layers className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400">No categories yet.</p>
                  <Link href="/admin/categories/new" className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add your first category
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
