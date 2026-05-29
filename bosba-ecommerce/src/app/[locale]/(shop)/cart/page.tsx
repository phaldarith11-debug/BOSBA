"use client";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, removeItem, updateQuantity, subtotalUsd } = useCartStore();
  const { currency, rate } = useCurrencyStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("empty.title")}</h2>
        <p className="text-gray-500 mb-6">{t("empty.hint")}</p>
        <Link href="/products" className="inline-block bg-red-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-red-700 transition-colors">
          {t("empty.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {t("title")} ({t("itemCount", { count: items.length })})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const name = locale === "km" ? item.nameKm : item.nameEn;
            const subName = locale === "km" ? item.nameEn : item.nameKm;
            return (
              <div key={item.productId} className="bg-white rounded-2xl p-4 flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-gray-900 text-sm line-clamp-1 ${locale === "km" ? "text-khmer" : ""}`}>{name}</h3>
                  <p className={`text-xs text-gray-500 mb-2 ${locale === "en" ? "text-khmer" : ""}`}>{subName}</p>
                  <p className="font-bold text-red-600 text-sm">{formatPrice(item.priceUsd, currency, rate)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-full text-sm">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 hover:text-red-600">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 hover:text-red-600 disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">{t("subtotal")}</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>{t("subtotal")}</span>
                <span>{formatPrice(subtotalUsd(), currency, rate)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{t("delivery")}</span>
                <span>{t("deliveryNote")}</span>
              </div>
            </div>
            <hr className="mb-4" />
            <div className="flex justify-between font-bold text-gray-900 mb-6">
              <span>{t("total")}</span>
              <span className="text-red-600">{formatPrice(subtotalUsd(), currency, rate)}</span>
            </div>
            <Link
              href="/checkout"
              className="block text-center bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              {t("checkout")}
            </Link>
            <Link href="/products" className="block text-center text-sm text-gray-500 mt-3 hover:text-red-600">
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
