"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { formatUsd, formatKhr } from "@/lib/currency";
import { CheckCircle, Clock, XCircle, Copy, Check, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { AbaManualSettings } from "@/lib/aba";

interface OrderData {
  id: string;
  orderNumber: string;
  totalUsd: number;
  totalKhr: number;
  status: string;
  paymentRefId: string | null;
  paymentProofUrl: string | null;
  paymentRejectReason: string | null;
}

export function ManualAbaPayment({ order, aba }: { order: OrderData; aba: AbaManualSettings }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [refId, setRefId] = useState(order.paymentRefId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(order.paymentProofUrl);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const submitted = status === "PAYMENT_SUBMITTED";
  const rejected = status === "PAYMENT_REJECTED";

  function copyAccount() {
    if (!aba.accountNumber) return;
    navigator.clipboard.writeText(aba.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refId.trim() && !file) {
      toast.error("Enter the transaction reference or attach a screenshot.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      if (refId.trim()) fd.append("refId", refId.trim());
      if (file) fd.append("file", file);

      const res = await fetch("/api/payment/proof", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to submit payment proof");
        return;
      }
      toast.success("Payment proof submitted — we'll confirm shortly!");
      setStatus("PAYMENT_SUBMITTED");
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">ABA Bank Transfer / KHQR</h1>
          <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-3xl font-bold text-red-600">{formatUsd(order.totalUsd)}</span>
            <span className="text-gray-400 text-sm">≈ {formatKhr(order.totalKhr)}</span>
          </div>
        </div>

        {/* Status banners */}
        {submitted && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Awaiting confirmation</p>
              <p className="text-sm text-amber-700 mt-0.5">
                We received your payment proof and will confirm your order shortly. You can close this page.
              </p>
            </div>
          </div>
        )}
        {rejected && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Payment not verified</p>
              <p className="text-sm text-red-700 mt-0.5">
                {order.paymentRejectReason || "We couldn't verify your payment."} Please re-submit below.
              </p>
            </div>
          </div>
        )}

        {/* Payment instructions card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">How to pay</h2>

          {/* KHQR image */}
          {aba.khqrImage ? (
            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 bg-white border rounded-xl overflow-hidden">
                <Image src={aba.khqrImage} alt="ABA KHQR code" fill className="object-contain p-2" sizes="224px" unoptimized />
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan with the ABA Mobile app (or any KHQR-enabled bank)</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Transfer the exact total to the ABA account below, then submit your proof.
            </p>
          )}

          {/* Account details */}
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
            <Row label="Account name" value={aba.accountName ?? "—"} />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Account number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">{aba.accountNumber ?? "—"}</span>
                {aba.accountNumber && (
                  <button onClick={copyAccount} className="text-gray-400 hover:text-red-600" aria-label="Copy account number">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
            <Row label="Amount" value={`${formatUsd(order.totalUsd)} (≈ ${formatKhr(order.totalKhr)})`} />
            <Row label="Reference" value={`#${order.orderNumber}`} mono />
          </div>

          {(aba.instructions || (!aba.accountNumber && !aba.khqrImage)) && (
            <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-xl p-3">
              {aba.instructions ||
                "Payment details haven't been configured yet. Please contact our support team to complete your payment."}
            </p>
          )}
        </div>

        {/* Proof submission */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Submit your payment proof</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction reference / ID</label>
              <input
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="e.g. 100FT0123456789"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment screenshot</label>
              <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-3 py-3 cursor-pointer hover:border-red-400 transition-colors">
                <Upload className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 truncate">{file ? file.name : "Tap to upload screenshot"}</span>
                <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              </label>
              {preview && (
                <div className="relative mt-3 w-32 h-32 rounded-xl overflow-hidden border">
                  {/* preview can be a blob: URL, so use a plain img */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Proof preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {rejected ? "Re-submit payment proof" : "Submit payment proof"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Provide the reference, a screenshot, or both. Our team will verify and confirm your order.
            </p>
          </form>
        )}

        {/* Submitted proof preview */}
        {submitted && (order.paymentProofUrl || order.paymentRefId) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
            <h2 className="font-semibold text-gray-900">Your submitted proof</h2>
            {order.paymentRefId && <p className="text-sm text-gray-600">Reference: <span className="font-mono">{order.paymentRefId}</span></p>}
            {order.paymentProofUrl && (
              <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
                <Image src={order.paymentProofUrl} alt="Submitted proof" fill className="object-cover" sizes="160px" unoptimized />
              </div>
            )}
          </div>
        )}

        <button onClick={() => router.push(`/orders/${order.id}`)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 underline">
          View order details
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-semibold text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
