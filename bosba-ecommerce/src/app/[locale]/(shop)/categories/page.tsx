import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { nameEn: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories;
}

export default async function CategoriesPage() {
  const t = await getTranslations("nav");
  const locale = await getLocale();
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{t("categoriesTab")}</h1>
      <p className="text-sm text-gray-500 mb-5 sm:mb-6">{t("products")}</p>

      {categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏷️</p>
          <p className="text-lg font-medium">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 transition-all hover:border-red-200 hover:shadow-card-hover active:scale-[0.98] animate-fade-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.nameEn}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl transition-colors group-hover:bg-red-100">
                  🏷️
                </div>
              )}
              <span className="text-center text-sm font-semibold text-gray-800 line-clamp-1">
                {locale === "km" ? cat.nameKm : cat.nameEn}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                {cat._count.products}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
