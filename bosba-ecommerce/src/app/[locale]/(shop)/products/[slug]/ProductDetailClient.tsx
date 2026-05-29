"use client";
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, ChevronRight, Minus, Plus, CheckCircle, Truck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { currency, rate } = useCurrencyStore();

  const name = locale === "km" ? product.nameKm : product.nameEn;
  const altName = locale === "km" ? product.nameEn : product.nameKm;
  const description = locale === "km" ? product.descriptionKm : product.descriptionEn;

  const price = formatPrice(product.priceUsd, currency, rate);
  const comparePrice = product.comparePrice ? formatPrice(product.comparePrice, currency, rate) : null;
  const discount = product.comparePrice ? Math.round((1 - product.priceUsd / product.comparePrice) * 100) : null;

  function handleAddToCart() {
    if (product.stock === 0) return;
    addItem({ id: product.id, productId: product.id, nameEn: product.nameEn, nameKm: product.nameKm, priceUsd: product.priceUsd, priceKhr: product.priceKhr, quantity, imageUrl: product.images[0], stock: product.stock });
    toast.success(t("addedToCart", { name: product.nameEn }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
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

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.nameEn} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
            {discount && <span className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? "border-red-600" : "border-transparent"}`}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{locale === "km" ? product.category.nameKm : product.category.nameEn}</p>
          <h1 className={`text-2xl font-bold text-gray-900 mb-1 ${locale === "km" ? "text-khmer" : ""}`}>{name}</h1>
          {altName && <p className={`text-lg text-gray-500 mb-4 ${locale === "en" ? "text-khmer" : ""}`}>{altName}</p>}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-red-600">{price}</span>
            {comparePrice && <span className="text-lg text-gray-400 line-through">{comparePrice}</span>}
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
            <div className="flex items-center border border-gray-200 rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-red-600"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:text-red-600" disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50">
              <ShoppingCart className="h-5 w-5" />{t("addToCart")}
            </button>
            <button className="p-3 border border-gray-200 rounded-full hover:border-red-600 hover:text-red-600 transition-colors"><Heart className="h-5 w-5" /></button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-gray-400" /><span>{t("freeDelivery")}</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-400">💳</span><span>{t("paymentMethods")}</span></div>
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
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t("related")}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
