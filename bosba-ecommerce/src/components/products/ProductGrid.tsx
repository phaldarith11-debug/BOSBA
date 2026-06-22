"use client";
import { useTranslations } from "next-intl";
import { ProductCard } from "./ProductCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { ProductWithCategory } from "@/types";

interface Props {
  products: ProductWithCategory[];
  loading?: boolean;
  /** When set, renders a friendly error state with an optional retry button. */
  error?: boolean;
  onRetry?: () => void;
}

// 2 columns on every phone width (was 1 column under 400px), then 3/4 up.
const GRID_CLASS = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4";

export function ProductGrid({ products, loading, error, onRetry }: Props) {
  const t = useTranslations("products");

  if (loading) return <SkeletonGrid count={8} />;

  if (error) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-lg font-medium text-gray-600">{t("error.title")}</p>
        <p className="text-sm">{t("error.hint")}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-700 active:scale-95 transition-all"
          >
            {t("error.retry")}
          </button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-lg font-medium">{t("empty.title")}</p>
        <p className="text-sm">{t("empty.hint")}</p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
