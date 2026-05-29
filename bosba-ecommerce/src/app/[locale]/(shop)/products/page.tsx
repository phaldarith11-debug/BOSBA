import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Link } from "@/i18n/navigation";
import { SortSelect } from "./SortSelect";
import type { ProductWithCategory } from "@/types";
import type { Prisma } from "@prisma/client";

interface SearchParams {
  page?: string;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  sort?: string;
  [key: string]: string | undefined;
}

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page ?? "1");
  const limit = 12;

  const where: Prisma.ProductWhereInput = { active: true };
  if (params.category) where.category = { slug: params.category };
  if (params.featured === "true") where.featured = true;
  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameKm: { contains: params.search } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.priceUsd = {};
    if (params.minPrice) where.priceUsd = { ...where.priceUsd as object, gte: parseFloat(params.minPrice) };
    if (params.maxPrice) where.priceUsd = { ...where.priceUsd as object, lte: parseFloat(params.maxPrice) };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price_asc"  ? { priceUsd: "asc" } :
    params.sort === "price_desc" ? { priceUsd: "desc" } :
    params.sort === "name"       ? { nameEn: "asc" } :
    { createdAt: "desc" };

  const [raw, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, skip: (page - 1) * limit, take: limit, orderBy }),
    prisma.product.count({ where }),
  ]);

  return {
    products: raw.map((p) => ({
      ...p,
      priceUsd: Number(p.priceUsd),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    })) as ProductWithCategory[],
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export default async function ProductsPage({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: { locale: string };
}) {
  const t = await getTranslations("products");
  const locale = await getLocale();
  const categories = await prisma.category.findMany({ where: { parentId: null }, orderBy: { nameEn: "asc" } });
  const { products, total, pages, page } = await getProducts(searchParams);

  const activeCategory = categories.find((c) => c.slug === searchParams.category);
  const pageTitle = searchParams.search
    ? t("searchResults", { query: searchParams.search })
    : activeCategory
    ? (locale === "km" ? activeCategory.nameKm : activeCategory.nameEn)
    : t("title");

  // params is used for locale-aware category name above via getLocale()
  void params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("found", { count: total })}</p>
        </div>
        <SortSelect
          currentSort={searchParams.sort ?? ""}
          labels={{
            latest:    t("sort.latest"),
            priceAsc:  t("sort.priceAsc"),
            priceDesc: t("sort.priceDesc"),
            nameAz:    t("sort.nameAz"),
          }}
        />
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <ProductFilters categories={categories} searchParams={searchParams} />
        </aside>

        <div className="flex-1">
          <ProductGrid products={products} />

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                const url = new URL("/products", "http://localhost");
                Object.entries(searchParams).forEach(([k, v]) => v && url.searchParams.set(k, v));
                url.searchParams.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/products${url.search}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      p === page ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
