"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice, usdToKhr } from "@/lib/currency";
import { Truck, CheckCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface DeliveryZone {
  id: string;
  nameEn: string;
  nameKm: string;
  priceUsd: number;
  priceKhr: number;
  estimatedDays: number;
  freeOverUsd: number | null;
  provinces: string[];
}

const CAMBODIA_PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Battambang",
  "Kampong Cham",
  "Kandal",
  "Kampot",
  "Takeo",
  "Prey Veng",
  "Kampong Speu",
  "Kampong Thom",
  "Kampong Chhnang",
  "Kratie",
  "Mondulkiri",
  "Ratanakiri",
  "Stung Treng",
  "Preah Vihear",
  "Oddar Meanchey",
  "Koh Kong",
  "Kep",
  "Pailin",
  "Pursat",
  "Svay Rieng",
  "Tbong Khmum",
];

const PAYMENT_METHODS = [
  { value: "ABA_BANK",    label: "ABA Bank (PayWay QR)", icon: "🏦" },
  { value: "ACLEDA_BANK", label: "ACLEDA Bank",          icon: "🏦" },
  { value: "WING_MONEY",  label: "Wing Money",           icon: "💸" },
  { value: "COD",         label: "Cash on Delivery",     icon: "📦" },
  { value: "PI_PAY",      label: "Pi Pay",               icon: "📱" },
];

function zoneForProvince(province: string, zones: DeliveryZone[]): DeliveryZone | null {
  if (!province) return null;
  return (
    zones.find((z) => z.provinces.includes(province)) ??
    zones.find((z) => z.provinces.includes("Other Province")) ??
    null
  );
}

function effectiveFee(zone: DeliveryZone | null, subtotal: number): number {
  if (!zone) return 0;
  if (zone.freeOverUsd !== null && subtotal >= zone.freeOverUsd) return 0;
  return zone.priceUsd;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, subtotalUsd, clearCart } = useCartStore();
  const { currency, rate } = useCurrencyStore();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [form, setForm] = useState({
    fullName:    session?.user?.name ?? "",
    phone:       "",
    addressLine1:"",
    addressLine2:"",
    city:        "",
    province:    "",
    paymentMethod: "COD",
    notes:       "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/checkout");
    fetch("/api/delivery-zones").then((r) => r.json()).then(setZones);
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) setForm((f) => ({ ...f, fullName: session.user!.name! }));
  }, [session]);

  const sub = subtotalUsd();
  const zone = useMemo(() => zoneForProvince(form.province, zones), [form.province, zones]);
  const deliveryFeeUsd = useMemo(() => effectiveFee(zone, sub - discount), [zone, sub, discount]);
  const isFreeDelivery = zone !== null && deliveryFeeUsd === 0;
  const amountToFree = zone?.freeOverUsd ? Math.max(0, zone.freeOverUsd - (sub - discount)) : null;
  const total = sub + deliveryFeeUsd - discount;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-500 mb-4">{t("emptyCart")}</p>
        <Link href="/products" className="text-red-600 hover:underline">{t("continueShopping")}</Link>
      </div>
    );
  }

  async function applyCoupon() {
    const res = await fetch(`/api/coupons/validate?code=${couponCode}&subtotal=${sub}`);
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    setDiscount(data.discountUsd);
    toast.success(t("coupon.applied", { discount: formatPrice(data.discountUsd, currency, rate) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zone) { toast.error("Select a province to calculate delivery"); return; }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          nameEn: i.nameEn, nameKm: i.nameKm,
          priceUsd: i.priceUsd, priceKhr: i.priceKhr,
          quantity: i.quantity, imageUrl: i.imageUrl,
        })),
        addressData: {
          fullName:     form.fullName,
          phone:        form.phone.startsWith("+855") ? form.phone : `+855${form.phone}`,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city:         form.city,
          province:     form.province,
        },
        deliveryZoneId: zone.id,
        paymentMethod:  form.paymentMethod,
        couponCode:     couponCode || undefined,
        notes:          form.notes,
        subtotalUsd:    sub,
        exchangeRate:   rate,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const order = await res.json();
      clearCart();
      toast.success(t("success"));
      router.push(`/payment/${order.id}`);
    } else {
      const data = await res.json();
      toast.error(data.error ?? t("error"));
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* ── Left column ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">{t("address.title")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address.fullName")}</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address.phone")}</label>
                <div className="flex gap-2">
                  <span className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 flex-shrink-0">+855</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="12 345 678"
                  />
                </div>
              </div>

              {/* Province selector — drives zone selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address.province")}</label>
                <select
                  required
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">{t("address.selectProvince")}</option>
                  {CAMBODIA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address.city")}</label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address.address")}</label>
                <input
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t("address.addressPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Delivery fee card — auto-populated from province */}
          {form.province && (
            <DeliveryCard
              zone={zone}
              subtotal={sub - discount}
              fee={deliveryFeeUsd}
              isFree={isFreeDelivery}
              amountToFree={amountToFree}
              currency={currency}
              rate={rate}
            />
          )}

          {/* Payment method */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">{t("payment.title")}</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                    form.paymentMethod === pm.value
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.value}
                    checked={form.paymentMethod === pm.value}
                    onChange={() => setForm({ ...form, paymentMethod: pm.value })}
                    className="text-red-600"
                  />
                  <span className="text-lg">{pm.icon}</span>
                  <span className="font-medium text-sm">{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">{t("notes.title")}</h2>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder={t("notes.placeholder")}
            />
          </div>
        </div>

        {/* ── Order summary sidebar ───────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-4">
            <h2 className="font-bold text-gray-900">{t("summary.title")}</h2>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1">{item.nameEn} ×{item.quantity}</span>
                  <span className="font-medium ml-2">{formatPrice(item.priceUsd * item.quantity, currency, rate)}</span>
                </div>
              ))}
            </div>

            <hr />

            {/* Coupon */}
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t("coupon.placeholder")}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="bg-gray-100 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {t("coupon.apply")}
              </button>
            </div>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{t("summary.subtotal")}</span>
                <span>{formatPrice(sub, currency, rate)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("summary.delivery")}</span>
                {zone ? (
                  isFreeDelivery ? (
                    <span className="text-green-600 font-semibold">Free!</span>
                  ) : (
                    <span>{formatPrice(deliveryFeeUsd, currency, rate)}</span>
                  )
                ) : (
                  <span className="text-gray-400 text-xs">Select province</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("summary.discount")}</span>
                  <span>-{formatPrice(discount, currency, rate)}</span>
                </div>
              )}
            </div>

            <hr />

            <div className="flex justify-between font-bold text-gray-900">
              <span>{t("summary.total")}</span>
              <span className="text-red-600">{formatPrice(total, currency, rate)}</span>
            </div>
            {currency === "USD" && (
              <p className="text-xs text-gray-400 text-right">≈ ៛{usdToKhr(total, rate).toLocaleString()}</p>
            )}

            <button
              type="submit"
              disabled={loading || !zone}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? t("submitting") : t("submit")}
            </button>

            {!zone && form.province === "" && (
              <p className="text-xs text-center text-gray-400">Enter your province to continue</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Delivery info card ───────────────────────────────────────────────── */
function DeliveryCard({
  zone, subtotal, fee, isFree, amountToFree, currency, rate,
}: {
  zone: DeliveryZone | null;
  subtotal: number;
  fee: number;
  isFree: boolean;
  amountToFree: number | null;
  currency: "USD" | "KHR";
  rate: number;
}) {
  if (!zone) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        No delivery zone found for this province. Please contact support.
      </div>
    );
  }

  const progressPct =
    zone.freeOverUsd && !isFree
      ? Math.min(100, Math.round((subtotal / zone.freeOverUsd) * 100))
      : null;

  return (
    <div className={`rounded-2xl p-5 border-2 shadow-sm transition-colors ${isFree ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 ${isFree ? "bg-green-100" : "bg-red-50"}`}>
          <Truck className={`h-5 w-5 ${isFree ? "text-green-600" : "text-red-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900">{zone.nameEn}</p>
            {isFree ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Free!
              </span>
            ) : (
              <span className="font-bold text-red-600">{formatPrice(fee, currency, rate)}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Estimated {zone.estimatedDays} {zone.estimatedDays === 1 ? "day" : "days"} delivery
          </p>

          {/* Free-delivery progress bar */}
          {!isFree && zone.freeOverUsd && amountToFree !== null && amountToFree > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Add{" "}
                <span className="font-semibold text-green-600">
                  {formatPrice(amountToFree, currency, rate)}
                </span>{" "}
                more for <strong>free delivery!</strong>
              </p>
            </div>
          )}

          {isFree && zone.freeOverUsd && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Free delivery on orders over {formatPrice(zone.freeOverUsd, currency, rate)} ✓
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
