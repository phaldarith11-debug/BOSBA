"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface Category {
  id: string;
  nameEn: string;
  nameKm: string;
  slug: string;
}

interface Props {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, searchParams }: Props) {
  const t = useTranslations("products.filters");
  const locale = useLocale();
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? "");

  function applyFilters(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{t("categories")}</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => applyFilters({ category: undefined })}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${!searchParams.category ? "bg-red-50 text-red-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {t("allCategories")}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => applyFilters({ category: cat.slug })}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${searchParams.category === cat.slug ? "bg-red-50 text-red-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
              >
                <span className={locale === "km" ? "text-khmer" : ""}>{locale === "km" ? cat.nameKm : cat.nameEn}</span>
                <span className={`text-gray-400 text-xs ml-1 ${locale === "en" ? "text-khmer" : ""}`}>({locale === "en" ? cat.nameKm : cat.nameEn})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{t("priceRange")}</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder={t("min")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder={t("max")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          onClick={() => applyFilters({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })}
          className="mt-2 w-full bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t("apply")}
        </button>
      </div>

      {/* In stock only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded text-red-600"
            checked={searchParams.inStock === "true"}
            onChange={(e) => applyFilters({ inStock: e.target.checked ? "true" : undefined })}
          />
          <span className="text-sm text-gray-700">{t("inStock")}</span>
        </label>
      </div>

      {/* Clear */}
      {(searchParams.category || searchParams.minPrice || searchParams.maxPrice) && (
        <button
          onClick={() => router.push("/products")}
          className="w-full text-sm text-gray-500 underline"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
