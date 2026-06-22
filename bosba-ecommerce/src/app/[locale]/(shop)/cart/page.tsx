"use client";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice } from "@/lib/currency";
import toast from "react-hot-toast";

// Promo code handed to checkout (which owns the authoritative coupon logic).
const COUPON_KEY = "bosba_coupon";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotalUsd } = useCartStore();
  const { currency, rate } = useCurrencyStore();

  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");

  const sub = subtotalUsd();
  const total = Math.max(0, sub - discount);

  async function applyPromo() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(c)}&subtotal=${sub}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setDiscount(data.discountUsd);
      setAppliedCode(c);
      // Pre-fill the code at checkout so it re-validates server-side on order.
      try {
        sessionStorage.setItem(COUPON_KEY, c);
      } catch {
        /* ignore */
      }
      toast.success(`Promo applied · −${formatPrice(data.discountUsd, currency, rate)}`);
    } catch {
      toast.error("Could not check that code");
    } finally {
      setApplying(false);
    }
  }

  function clearPromo() {
    setDiscount(0);
    setAppliedCode("");
    setCode("");
    try {
      sessionStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
          <ShoppingBag className="h-11 w-11 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("empty.title")}</h2>
        <p className="text-gray-500 mb-6">{t("empty.hint")}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-btn"
        >
          {t("empty.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-8">
        {t("title")} ({t("itemCount", { count: items.length })})
      </h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ── Items ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const name = locale === "km" ? item.nameKm : item.nameEn;
            const subName = locale === "km" ? item.nameEn : item.nameKm;
            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-card animate-fade-up"
              >
                <Link
                  href={`/products`}
                  className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden"
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-gray-900 text-sm line-clamp-1 ${locale === "km" ? "text-khmer" : ""}`}>
                    {name}
                  </h3>
                  <p className={`text-xs text-gray-400 mb-2 line-clamp-1 ${locale === "en" ? "text-khmer" : ""}`}>
                    {subName}
                  </p>
                  <p className="font-bold text-red-600 text-sm">{formatPrice(item.priceUsd, currency, rate)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    className="text-gray-300 hover:text-red-600 active:scale-90 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center bg-gray-100 rounded-full text-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-red-600 active:scale-90 transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span key={item.quantity} className="w-7 text-center font-semibold animate-scale-in">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-red-600 active:scale-90 disabled:opacity-30 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Summary (desktop sidebar) ─────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">{t("subtotal")}</h2>

            {/* Promo code */}
            <div className="mb-4">
              {appliedCode ? (
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-700">
                    <Tag className="h-4 w-4" /> {appliedCode}
                  </span>
                  <button onClick={clearPromo} aria-label="Remove promo" className="text-green-600 active:scale-90">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Promo code"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={applying || !code.trim()}
                    className="rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
                  >
                    {applying ? "…" : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>{t("subtotal")}</span>
                <span>{formatPrice(sub, currency, rate)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatPrice(discount, currency, rate)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>{t("delivery")}</span>
                <span>{t("deliveryNote")}</span>
              </div>
            </div>
            <hr className="mb-4" />
            <div className="flex justify-between font-bold text-gray-900 mb-6">
              <span>{t("total")}</span>
              <span className="text-red-600">{formatPrice(total, currency, rate)}</span>
            </div>
            <Link
              href="/checkout"
              className="hidden md:flex items-center justify-center bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-btn"
            >
              {t("checkout")}
            </Link>
            <Link href="/products" className="block text-center text-sm text-gray-500 mt-3 hover:text-red-600">
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky checkout bar (app-style) ─────────────── */}
      <div className="fixed inset-x-0 bottom-tabbar z-30 border-t border-gray-100 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="leading-tight">
            <p className="text-[11px] text-gray-400">{t("total")}</p>
            <p className="text-lg font-black text-red-600">{formatPrice(total, currency, rate)}</p>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-btn active:scale-[0.98] transition-transform"
          >
            {t("checkout")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
