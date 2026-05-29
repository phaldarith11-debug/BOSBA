"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ABAQRDisplay } from "@/components/payment/ABAQRDisplay";
import { WingPaymentInfo } from "@/components/payment/WingPaymentInfo";
import { CODConfirmation } from "@/components/payment/CODConfirmation";
import { formatUsd, formatKhr } from "@/lib/currency";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  totalUsd: number;
  totalKhr: number;
  paymentMethod: string;
  paymentStatus: string;
  existingTranId: string | null;
  existingQrData: string | null;
  existingTxnStatus: string | null;
  existingExpiresAt: string | null;
  wingAccount: string | null;
  wingAccountName: string | null;
}

export function PaymentPageClient({ order }: { order: OrderData }) {
  const router = useRouter();
  const [tranId, setTranId] = useState<string | null>(order.existingTranId);
  const [qrData, setQrData] = useState<string | null>(order.existingQrData);
  const [creating, setCreating] = useState(false);
  const [txnStatus, setTxnStatus] = useState<string>(order.existingTxnStatus ?? "PENDING");
  const [error, setError] = useState<string | null>(null);

  const isCOD = order.paymentMethod === "COD";
  const isABA = order.paymentMethod === "ABA_BANK";
  const isWing = order.paymentMethod === "WING_MONEY";
  const needsQR = isABA || isWing;

  useEffect(() => {
    if (isCOD) {
      const t = setTimeout(() => router.push(`/orders/${order.id}`), 3000);
      return () => clearTimeout(t);
    }
  }, [isCOD, order.id, router]);

  useEffect(() => {
    if (!needsQR) return;
    const alreadyValid =
      tranId && qrData && txnStatus === "PENDING" &&
      order.existingExpiresAt && new Date(order.existingExpiresAt) > new Date();
    if (alreadyValid) return;
    if (txnStatus === "PAID") return;

    async function initiate() {
      setCreating(true);
      setError(null);
      try {
        const res = await fetch("/api/payment/aba/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to create payment"); return; }
        if (data.alreadyPaid) { setTxnStatus("PAID"); return; }
        setTranId(data.tranId);
        setQrData(data.qrData ?? null);
        setTxnStatus("PENDING");
      } catch {
        setError("Network error — please refresh");
      } finally {
        setCreating(false);
      }
    }

    initiate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePaid() {
    setTxnStatus("PAID");
    setTimeout(() => router.push(`/orders/${order.id}`), 2000);
  }

  function handleExpired() { setTxnStatus("EXPIRED"); }

  function handleRetry() {
    setTranId(null);
    setQrData(null);
    setTxnStatus("PENDING");
    setError(null);
  }

  if (txnStatus === "PAID") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-500 mb-2">Order #{order.orderNumber}</p>
          <p className="text-sm text-gray-400">Redirecting to your order…</p>
        </div>
      </div>
    );
  }

  if (txnStatus === "FAILED" || txnStatus === "EXPIRED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {txnStatus === "EXPIRED" ? "QR Code Expired" : "Payment Failed"}
          </h1>
          <p className="text-gray-500 mb-6">
            {txnStatus === "EXPIRED"
              ? "The QR code has expired. Please generate a new one."
              : "The payment was not completed. Please try again."}
          </p>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if ((creating || (!qrData && needsQR)) && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Preparing your payment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">{error}</p>
          <button onClick={handleRetry} className="text-red-600 underline text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-red-600">{formatUsd(order.totalUsd)}</span>
            <span className="text-gray-400 text-sm">≈ ៛{formatKhr(order.totalKhr)}</span>
          </div>
        </div>

        {isCOD && <CODConfirmation order={order} />}

        {isABA && tranId && qrData && (
          <ABAQRDisplay
            qrData={qrData}
            tranId={tranId}
            amount={order.totalUsd}
            expiresAt={order.existingExpiresAt ?? undefined}
            onPaid={handlePaid}
            onExpired={handleExpired}
          />
        )}

        {isWing && tranId && (
          <WingPaymentInfo
            qrData={qrData}
            tranId={tranId}
            amount={order.totalUsd}
            amountKhr={order.totalKhr}
            wingAccount={order.wingAccount}
            wingAccountName={order.wingAccountName}
            expiresAt={order.existingExpiresAt ?? undefined}
            onPaid={handlePaid}
            onExpired={handleExpired}
          />
        )}
      </div>
    </div>
  );
}
