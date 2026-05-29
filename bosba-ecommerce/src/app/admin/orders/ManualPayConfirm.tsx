"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export function ManualPayConfirm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!window.confirm("Mark this order as paid?")) return;
    setLoading(true);
    const res = await fetch("/api/payment/manual-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, note: "Manually confirmed by admin" }),
    });
    setLoading(false);
    if (res.ok) { toast.success("Payment confirmed"); router.refresh(); }
    else { toast.error("Failed"); }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
    >
      <CheckCircle className="h-3 w-3" />
      {loading ? "…" : "Confirm paid"}
    </button>
  );
}
