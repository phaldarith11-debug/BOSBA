"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import toast from "react-hot-toast";

export function TrackingInput({ orderId, currentCode }: { orderId: string; currentCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(currentCode);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode: code }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Tracking code saved"); router.refresh(); }
    else toast.error("Failed to save");
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. TH123456789KH"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <button
        onClick={save}
        disabled={saving || code === currentCode}
        className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "…" : "Save"}
      </button>
    </div>
  );
}
