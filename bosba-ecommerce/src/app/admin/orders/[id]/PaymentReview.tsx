"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function PaymentReview({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function review(action: "approve" | "reject") {
    setBusy(action);
    try {
      const res = await fetch("/api/admin/payment-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, reason: action === "reject" ? reason : undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to update payment");
        return;
      }
      toast.success(action === "approve" ? "Payment approved" : "Payment rejected");
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {!rejecting ? (
        <div className="flex gap-2">
          <button
            onClick={() => review("approve")}
            disabled={busy !== null}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60"
          >
            {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve Payment
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy !== null}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason shown to the customer (e.g. amount didn't match)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => review("reject")}
              disabled={busy !== null}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-60"
            >
              {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Confirm Reject
            </button>
            <button
              onClick={() => { setRejecting(false); setReason(""); }}
              disabled={busy !== null}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
