import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/currency";
import { OrderStatusUpdater } from "../OrderStatusUpdater";
import { ManualPayConfirm } from "../ManualPayConfirm";
import { PaymentReview } from "./PaymentReview";
import { TrackingInput } from "./TrackingInput";
import { PrintInvoice } from "./PrintInvoice";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>{label}</span>
  );
}

const PAY_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      deliveryZone: true,
      items: true,
      coupon: true,
    },
  });

  if (!order) notFound();

  return (
    <div>
      {/* Breadcrumb + header */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-4">
        <Link href="/admin" className="hover:text-red-600 transition-colors">Dashboard</Link>
        <span className="text-gray-300">/</span>
        <Link href="/admin/orders" className="hover:text-red-600 transition-colors">Orders</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">#{order.orderNumber}</span>
      </nav>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PrintInvoice />
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          {order.paymentStatus === "PENDING" && order.paymentMethod !== "COD" && (
            <ManualPayConfirm orderId={order.id} />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{item.nameEn}</p>
                    <p className="text-xs text-gray-500">{item.nameKm}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatUsd(Number(item.priceUsd))} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm">{formatUsd(Number(item.totalUsd))}</p>
                    <p className="text-xs text-gray-400">≈ ៛{item.totalKhr.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Tracking Code</h2>
            <TrackingInput orderId={order.id} currentCode={order.trackingCode ?? ""} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Payment summary */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatUsd(Number(order.subtotalUsd))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span><span>{formatUsd(Number(order.deliveryFeeUsd))}</span>
              </div>
              {Number(order.discountUsd) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
                  <span>-{formatUsd(Number(order.discountUsd))}</span>
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
            </div>
            <hr className="mt-4 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium">{order.paymentMethod.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Pay Status</span>
              <Badge label={order.paymentStatus} color={PAY_COLORS[order.paymentStatus] ?? "bg-gray-100 text-gray-600"} />
            </div>
            {order.exchangeRate && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Rate at order</span>
                <span className="text-gray-700">1 USD = ៛{order.exchangeRate}</span>
              </div>
            )}
          </div>

          {/* Manual payment proof + review */}
          {(order.paymentMethod === "ABA_BANK" || order.paymentProofUrl || order.paymentRefId ||
            ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_REJECTED"].includes(order.status)) && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Payment Proof</h2>

              {order.paymentRefId ? (
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono font-medium text-gray-900">{order.paymentRefId}</span>
                </div>
              ) : null}
              {order.paymentSubmittedAt ? (
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-500">Submitted</span>
                  <span className="text-gray-700">{new Date(order.paymentSubmittedAt).toLocaleString()}</span>
                </div>
              ) : null}

              {order.paymentProofUrl ? (
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-48 rounded-xl overflow-hidden border mb-3 bg-gray-50">
                  <Image src={order.paymentProofUrl} alt="Payment proof" fill className="object-contain" sizes="320px" unoptimized />
                </a>
              ) : (
                <p className="text-sm text-gray-400 mb-3">No screenshot uploaded yet.</p>
              )}

              {order.paymentRejectReason && order.status === "PAYMENT_REJECTED" && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">
                  Rejected: {order.paymentRejectReason}
                </p>
              )}

              {order.status === "PAYMENT_SUBMITTED" ? (
                <PaymentReview orderId={order.id} />
              ) : order.paymentStatus !== "PAID" ? (
                <p className="text-xs text-gray-400">
                  Approve/Reject becomes available once the customer submits payment proof.
                </p>
              ) : null}
            </div>
          )}

          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <p className="font-medium text-gray-900">{order.user.name ?? "—"}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
            {order.user.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
          </div>

          {/* Delivery */}
          {order.address && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {[order.address.commune, order.address.district, order.address.city].filter(Boolean).join(", ")}
                </p>
                <p>{order.address.province}</p>
                {order.deliveryZone && (
                  <p className="text-xs text-gray-400 pt-1">
                    Zone: {order.deliveryZone.nameEn}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Order Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
