import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/currency";
import { PaymentReview } from "../orders/[id]/PaymentReview";
import { Banknote } from "lucide-react";

export default async function AdminPaymentsPage() {
  const orders = await prisma.order.findMany({
    where: { status: "PAYMENT_SUBMITTED" },
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { paymentSubmittedAt: "asc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Review</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manual ABA / KHQR payments awaiting your confirmation
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <Banknote className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No payments awaiting review</p>
          <p className="text-sm text-gray-400 mt-1">Submitted payments will appear here for approval.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-red-600 hover:underline">
                    #{order.orderNumber}
                  </Link>
                  <p className="text-sm text-gray-900 mt-0.5">{order.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{order.user.phone ?? order.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatUsd(Number(order.totalUsd))}</p>
                  <p className="text-xs text-gray-400">≈ ៛{order.totalKhr.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm space-y-1">
                {order.paymentRefId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-gray-900">{order.paymentRefId}</span>
                  </div>
                )}
                {order.paymentSubmittedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted</span>
                    <span className="text-gray-700">{new Date(order.paymentSubmittedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {order.paymentProofUrl ? (
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-52 rounded-xl overflow-hidden border bg-gray-50">
                  <Image src={order.paymentProofUrl} alt="Payment proof" fill className="object-contain" sizes="400px" unoptimized />
                </a>
              ) : (
                <p className="text-sm text-gray-400">No screenshot — reference only.</p>
              )}

              <PaymentReview orderId={order.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
