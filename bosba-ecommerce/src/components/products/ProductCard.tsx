"use client";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice } from "@/lib/currency";
import toast from "react-hot-toast";
import type { ProductWithCategory } from "@/types";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const t = useTranslations("products");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlistStore();
  const { currency, rate } = useCurrencyStore();

  const name    = locale === "km" ? product.nameKm : product.nameEn;
  const subName = locale === "km" ? product.nameEn : product.nameKm;
  const wishlisted = inWishlist(product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem({
      id:        product.id,
      productId: product.id,
      nameEn:    product.nameEn,
      nameKm:    product.nameKm,
      priceUsd:  product.priceUsd,
      priceKhr:  product.priceKhr,
      quantity:  1,
      imageUrl:  product.images[0],
      stock:     product.stock,
    });
    toast.success(t("addedToCart", { name: product.nameEn }));
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleWishlist({
      id:           product.id,
      nameEn:       product.nameEn,
      nameKm:       product.nameKm,
      priceUsd:     product.priceUsd,
      imageUrl:     product.images[0] ?? "",
      slug:         product.slug,
      categoryName: product.category.nameEn,
    });
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist", {
      icon: wishlisted ? "💔" : "❤️",
      duration: 1800,
    });
  }

  const price        = formatPrice(product.priceUsd, currency, rate);
  const comparePrice = product.comparePrice
    ? formatPrice(product.comparePrice, currency, rate)
    : null;
  const discount = product.comparePrice
    ? Math.round((1 - product.priceUsd / product.comparePrice) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden card"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.nameEn}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-5xl">
            📦
          </div>
        )}

        {/* Dim overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />

        {/* Discount badge */}
        {discount && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
            -{discount}%
          </span>
        )}

        {/* Out-of-stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {t("outOfStock")}
            </span>
          </div>
        )}

        {/* Wishlist button — always tappable on mobile, slides in on hover (desktop) */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center opacity-100 translate-x-0 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-200 active:scale-90 md:hover:scale-110 z-10"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          />
        </button>

        {/* Quick-add bar — desktop only (mobile uses the in-card button below) */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          aria-label={t("addToCart")}
          className="absolute bottom-0 left-0 right-0 bg-gray-900/95 text-white text-xs font-semibold py-2.5 hidden md:flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 hover:bg-red-600"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t("addToCart")}
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {product.category.nameEn}
        </p>
        <h3
          className={`font-semibold text-gray-900 text-sm line-clamp-2 leading-snug ${
            locale === "km" ? "text-khmer" : ""
          }`}
        >
          {name}
        </h3>
        {subName && (
          <p
            className={`text-[11px] text-gray-400 line-clamp-1 mt-0.5 ${
              locale === "en" ? "text-khmer" : ""
            }`}
          >
            {subName}
          </p>
        )}
        <div className="flex items-end justify-between gap-2 mt-2">
          <div className="min-w-0 flex items-center gap-2">
            <span className="font-bold text-red-600 text-sm">{price}</span>
            {comparePrice && (
              <span className="text-xs text-gray-400 line-through">{comparePrice}</span>
            )}
          </div>
          {/* Mobile add-to-cart — a real tap target since there is no hover */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={t("addToCart")}
            className="md:hidden flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-btn active:scale-90 disabled:opacity-40 transition-transform"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[10px] text-orange-500 font-medium mt-1">
            {t("onlyLeft", { count: product.stock })}
          </p>
        )}
      </div>
    </Link>
  );
}
