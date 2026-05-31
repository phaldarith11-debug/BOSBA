"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === currentStatus || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error — could not update status");
    } finally {
      setUpdating(false);
    }
  }

  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <select
      value={currentStatus}
      disabled={updating}
      onChange={(e) => handleChange(e.target.value)}
      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-red-500 ${
        updating ? "opacity-60 cursor-wait" : "cursor-pointer"
      } ${colors[currentStatus] ?? "bg-gray-100"}`}
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
