"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice } from "@/lib/currency";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const { currency, rate } = useCurrencyStore();
  const locale = useLocale();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart className="h-9 w-9 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save items you love to come back to them later.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-red-700 active:scale-95 transition-all"
        >
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Wishlist{" "}
          <span className="text-gray-400 font-normal text-lg">({items.length})</span>
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const name = locale === "km" ? item.nameKm : item.nameEn;
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-card overflow-hidden group card">
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="relative block aspect-square bg-gray-50">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-200">
                    📦
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {item.categoryName}
                </p>
                <h3
                  className={`font-semibold text-gray-900 text-sm line-clamp-2 mb-1 ${
                    locale === "km" ? "text-khmer" : ""
                  }`}
                >
                  {name}
                </h3>
                <p className="font-bold text-red-600 mb-3">
                  {formatPrice(item.priceUsd, currency, rate)}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-1 text-center text-sm font-semibold bg-red-600 text-white py-2 rounded-full hover:bg-red-700 active:scale-95 transition-all"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => {
                      remove(item.id);
                      toast("Removed from wishlist", { icon: "💔", duration: 1800 });
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-full transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
