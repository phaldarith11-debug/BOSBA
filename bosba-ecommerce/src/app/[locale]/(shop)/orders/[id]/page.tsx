import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react";
import { formatUsd } from "@/lib/currency";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const session = await getServerSession(authOptions);
  const localePrefix = params.locale !== "en" ? `/${params.locale}` : "";
  if (!session?.user?.id) redirect(`${localePrefix}/login`);

  const t = await getTranslations("order");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, deliveryZone: true, address: true, coupon: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const statusIndex = STATUS_STEPS.indexOf(order.status);
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title", { number: order.orderNumber })}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString(params.locale === "km" ? "km-KH" : "en-US", { dateStyle: "full" })}
          </p>
        </div>
        <Link href="/orders" className="text-sm text-red-600 hover:underline">{t("allOrders")}</Link>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <StatusIcon className={`h-8 w-8 ${order.status === "DELIVERED" ? "text-green-500" : order.status === "CANCELLED" ? "text-red-500" : "text-blue-500"}`} />
          <div>
            <p className="font-bold text-gray-900 text-lg">{t(`status.${order.status}` as Parameters<typeof t>[0])}</p>
            {order.trackingCode && <p className="text-sm text-gray-500">{t("tracking", { code: order.trackingCode })}</p>}
          </div>
        </div>

        {order.status !== "CANCELLED" && (
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${i <= statusIndex ? "bg-red-600" : "bg-gray-200"}`} />
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < statusIndex ? "bg-red-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t("items")}</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{item.nameEn}</p>
                <p className="text-xs text-gray-500 text-khmer">{item.nameKm}</p>
                <p className="text-xs text-gray-500 mt-1">{t("quantity", { qty: item.quantity })}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatUsd(Number(item.totalUsd))}</p>
                <p className="text-xs text-gray-400">≈ ៛{item.totalKhr.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Address */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t("paymentSummary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatUsd(Number(order.subtotalUsd))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span><span>{formatUsd(Number(order.deliveryFeeUsd))}</span>
            </div>
            {Number(order.discountUsd) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-{formatUsd(Number(order.discountUsd))}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <div className="text-right">
                <p className="text-red-600">{formatUsd(Number(order.totalUsd))}</p>
                <p className="text-xs text-gray-400">≈ ៛{order.totalKhr.toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-2 text-gray-500">
              <span>{t("paymentMethod")}: </span>
              <span className="font-medium">{order.paymentMethod.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        {order.address && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t("deliveryAddress")}</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.address.fullName}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>{order.address.city}, {order.address.province}</p>
              {order.deliveryZone && (
                <p className="text-xs text-gray-400 mt-2">{t("zone", { name: order.deliveryZone.nameEn })}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
