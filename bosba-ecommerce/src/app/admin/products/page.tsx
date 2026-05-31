import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/currency";
import { Plus, Search, Package } from "lucide-react";
import NextImage from "next/image";
import { AdminProductActions } from "./AdminProductActions";

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
}

function buildWhere(sp: SearchParams) {
  const where: Record<string, unknown> = {};
  if (sp.q) {
    where.OR = [
      { nameEn: { contains: sp.q, mode: "insensitive" } },
      { nameKm: { contains: sp.q, mode: "insensitive" } },
      { sku: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.category) where.categoryId = sp.category;
  switch (sp.status) {
    case "active":     where.active = true; break;
    case "inactive":   where.active = false; break;
    case "low_stock":  where.active = true; where.stock = { gt: 0, lte: 5 }; break;
    case "no_stock":   where.stock = 0; break;
  }
  return where;
}

const STATUS_TABS = [
  { key: "",          label: "All" },
  { key: "active",    label: "Active" },
  { key: "inactive",  label: "Hidden" },
  { key: "low_stock", label: "Low Stock" },
  { key: "no_stock",  label: "No Stock" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [products, categories, allCount, activeCount, inactiveCount, lowStockCount, noStockCount] =
    await Promise.all([
      prisma.product.findMany({
        where: buildWhere(searchParams),
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.category.findMany({ orderBy: { nameEn: "asc" }, select: { id: true, nameEn: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: false } }),
      prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

  const tabCounts: Record<string, number> = {
    "":          allCount,
    active:      activeCount,
    inactive:    inactiveCount,
    low_stock:   lowStockCount,
    no_stock:    noStockCount,
  };

  const currentStatus = searchParams.status ?? "";

  function tabHref(key: string) {
    const p = new URLSearchParams();
    if (key) p.set("status", key);
    if (searchParams.q) p.set("q", searchParams.q);
    if (searchParams.category) p.set("category", searchParams.category);
    const qs = p.toString();
    return `/admin/products${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your store&apos;s product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* WooCommerce-style status tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 overflow-x-auto">
        {STATUS_TABS.map(({ key, label }) => {
          const isActive = currentStatus === key;
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
                {tabCounts[key] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search by name or SKU…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            name="category"
            defaultValue={searchParams.category ?? ""}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>
          {searchParams.status && (
            <input type="hidden" name="status" value={searchParams.status} />
          )}
          <button
            type="submit"
            className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-900 transition-colors"
          >
            Search
          </button>
          {(searchParams.q || searchParams.category) && (
            <Link
              href={tabHref(currentStatus)}
              className="text-sm text-gray-400 hover:text-gray-600 underline py-2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchParams.q || searchParams.category || searchParams.status
                ? "Try adjusting your filters"
                : "Add your first product to get started"}
            </p>
            {!searchParams.q && !searchParams.category && !searchParams.status && (
              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-12"></th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const thumbUrl = product.images[0] ?? null;
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isNoStock = product.stock === 0;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {thumbUrl ? (
                            <NextImage
                              src={thumbUrl}
                              alt={product.nameEn}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium text-gray-900 hover:text-red-600 transition-colors"
                        >
                          {product.nameEn}
                        </Link>
                        {product.nameKm && (
                          <p className="text-gray-400 text-xs">{product.nameKm}</p>
                        )}
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {product.sku ?? <span className="text-gray-200">—</span>}
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 text-gray-500 text-xs">{product.category.nameEn}</td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatUsd(Number(product.priceUsd))}</p>
                        {product.comparePrice && Number(product.comparePrice) > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatUsd(Number(product.comparePrice))}
                          </p>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium text-sm ${
                            isNoStock
                              ? "text-red-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-gray-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                        {isLowStock && (
                          <span className="ml-1 text-[10px] text-amber-500 font-medium">Low</span>
                        )}
                        {isNoStock && (
                          <span className="ml-1 text-[10px] text-red-500 font-medium">Out</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          {product.active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <AdminProductActions productId={product.id} slug={product.slug} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-400">
              Showing {products.length} of {tabCounts[currentStatus] ?? allCount} products
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
