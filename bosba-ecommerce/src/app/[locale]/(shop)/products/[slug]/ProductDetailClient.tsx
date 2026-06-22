"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, ChevronRight, Minus, Plus, CheckCircle, Truck, Zap, ShieldCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice } from "@/lib/currency";
import { ProductGrid } from "@/components/products/ProductGrid";
import toast from "react-hot-toast";
import type { ProductWithCategory } from "@/types";

interface Product extends ProductWithCategory {
  variants: Array<{ id: string; name: string; value: string; stock: number; priceUsd: number | null; priceKhr: number | null }>;
}

export function ProductDetailClient({ product, related }: { product: Product; related: ProductWithCategory[] }) {
  const t = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { currency, rate } = useCurrencyStore();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlistStore();
  const wishlisted = inWishlist(product.id);

  // Mobile swipe carousel: track the active slide from scroll position.
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const name = locale === "km" ? product.nameKm : product.nameEn;
  const altName = locale === "km" ? product.nameEn : product.nameKm;
  const description = locale === "km" ? product.descriptionKm : product.descriptionEn;

  const price = formatPrice(product.priceUsd, currency, rate);
  const comparePrice = product.comparePrice ? formatPrice(product.comparePrice, currency, rate) : null;
  const discount = product.comparePrice ? Math.round((1 - product.priceUsd / product.comparePrice) * 100) : null;
  const images = product.images.length > 0 ? product.images : [];

  function addToCart() {
    if (product.stock === 0) return false;
    addItem({ id: product.id, productId: product.id, nameEn: product.nameEn, nameKm: product.nameKm, priceUsd: product.priceUsd, priceKhr: product.priceKhr, quantity, imageUrl: product.images[0], stock: product.stock });
    return true;
  }

  function handleAddToCart() {
    if (addToCart()) toast.success(t("addedToCart", { name: product.nameEn }));
  }

  function handleBuyNow() {
    if (addToCart()) router.push("/checkout");
  }

  function handleWishlist() {
    toggleWishlist({
      id: product.id, nameEn: product.nameEn, nameKm: product.nameKm,
      priceUsd: product.priceUsd, imageUrl: product.images[0] ?? "",
      slug: product.slug, categoryName: product.category.nameEn,
    });
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist", { icon: wishlisted ? "💔" : "❤️", duration: 1600 });
  }

  function onStripScroll() {
    const el = stripRef.current;
    if (!el) return;
    setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-8 pb-28 md:pb-8">
      {/* Breadcrumb — desktop only */}
      <nav className="hidden md:flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-red-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-red-600">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-red-600">
          {locale === "km" ? product.category.nameKm : product.category.nameEn}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 truncate max-w-[200px]">{name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-0 md:gap-10 mb-8 md:mb-16">
        {/* ── Images ─────────────────────────────────────────── */}
        <div>
          {/* Mobile: swipeable carousel */}
          <div className="relative md:hidden">
            <div
              ref={stripRef}
              onScroll={onStripScroll}
              className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar aspect-square bg-gray-100"
            >
              {images.length > 0 ? (
                images.map((img, i) => (
                  <div key={i} className="relative w-full flex-shrink-0 snap-center">
                    <Image src={img} alt={product.nameEn} fill className="object-contain" sizes="100vw" priority={i === 0} />
                  </div>
                ))
              ) : (
                <div className="flex w-full items-center justify-center text-gray-300 text-6xl">📦</div>
              )}
            </div>
            {discount && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">-{discount}%</span>
            )}
            <button
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur active:scale-90 transition-transform"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            </button>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? "w-5 bg-red-600" : "w-1.5 bg-white/80 shadow"}`} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop: main image + thumbnails */}
          <div className="hidden md:block">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
              {images[selectedImage] ? (
                <Image src={images[selectedImage]} alt={product.nameEn} fill className="object-contain" sizes="50vw" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl">📦</div>
              )}
              {discount && <span className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-red-600" : "border-transparent hover:border-gray-200"}`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Info ───────────────────────────────────────────── */}
        <div className="px-4 pt-5 md:px-0 md:pt-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{locale === "km" ? product.category.nameKm : product.category.nameEn}</p>
          <h1 className={`text-xl md:text-2xl font-bold text-gray-900 mb-1 ${locale === "km" ? "text-khmer" : ""}`}>{name}</h1>
          {altName && <p className={`text-base md:text-lg text-gray-400 mb-4 ${locale === "en" ? "text-khmer" : ""}`}>{altName}</p>}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-black text-red-600">{price}</span>
            {comparePrice && <span className="text-lg text-gray-400 line-through">{comparePrice}</span>}
            {discount && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">Save {discount}%</span>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {product.stock < 10 ? t("onlyLeft", { count: product.stock }) : t("inStock")}
                </span>
              </>
            ) : (
              <span className="text-sm text-red-500 font-medium">{t("outOfStock")}</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">{t("quantity")}</span>
            <div className="flex items-center bg-gray-100 rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:text-red-600 active:scale-90 transition-all"><Minus className="h-4 w-4" /></button>
              <span key={quantity} className="w-10 text-center text-sm font-semibold animate-scale-in">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:text-red-600 active:scale-90 disabled:opacity-30 transition-all" disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {/* CTA — desktop (mobile uses the sticky bar below) */}
          <div className="hidden md:flex gap-3 mb-8">
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-btn">
              <Zap className="h-5 w-5" />{t("buyNow")}
            </button>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 font-semibold py-3 rounded-full hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-50">
              <ShoppingCart className="h-5 w-5" />{t("addToCart")}
            </button>
            <button onClick={handleWishlist} aria-label="Toggle wishlist" className="p-3 border border-gray-200 rounded-full hover:border-red-600 active:scale-90 transition-all">
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center gap-2.5"><Truck className="h-4 w-4 text-red-400" /><span>{t("freeDelivery")}</span></div>
            <div className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 text-red-400" /><span>{t("paymentMethods")}</span></div>
          </div>

          {description && (
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 mb-3">{t("description")}</h2>
              <p className={`text-gray-600 text-sm leading-relaxed ${locale === "km" ? "text-khmer" : ""}`}>{description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="px-4 md:px-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">{t("related")}</h2>
          <ProductGrid products={related} />
        </section>
      )}

      {/* ── Mobile sticky action bar ───────────────────────────── */}
      <div className="fixed inset-x-0 bottom-tabbar z-30 border-t border-gray-100 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-red-600 py-3 text-sm font-bold text-red-600 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("addToCart")}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-btn active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {t("buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
