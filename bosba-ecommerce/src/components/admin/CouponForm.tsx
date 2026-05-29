"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FormValues {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderUsd: string;
  maxUsage: string;
  expiresAt: string;
  active: boolean;
}

interface Props {
  initialValues?: Partial<FormValues>;
  couponId?: string;
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export function CouponForm({ initialValues, couponId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormValues>({
    code: "", description: "", discountType: "PERCENTAGE",
    discountValue: "", minOrderUsd: "", maxUsage: "",
    expiresAt: "", active: true,
    ...initialValues,
  });

  function set(patch: Partial<FormValues>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }

    setSaving(true);
    try {
      const url = couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons";
      const method = couponId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(couponId ? "Coupon updated!" : "Coupon created!");
        router.push("/admin/coupons");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!couponId || !confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${couponId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Coupon deleted");
      router.push("/admin/coupons");
      router.refresh();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Cannot delete");
    }
  }

  const isPercentage = form.discountType === "PERCENTAGE";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900">Coupon Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Code <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                  className={`${inputCls} font-mono tracking-widest uppercase`}
                  placeholder="SAVE20"
                />
                <p className="text-xs text-gray-400 mt-1">Automatically uppercased</p>
              </div>
              <div>
                <label className={labelCls}>Discount Type <span className="text-red-500">*</span></label>
                <select
                  value={form.discountType}
                  onChange={(e) => set({ discountType: e.target.value })}
                  className={inputCls}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (USD)</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {isPercentage ? "%" : "$"}
                  </span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    max={isPercentage ? 100 : undefined}
                    step="0.01"
                    value={form.discountValue}
                    onChange={(e) => set({ discountValue: e.target.value })}
                    className={`${inputCls} pl-7`}
                    placeholder={isPercentage ? "20" : "5.00"}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Min. Order (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderUsd}
                    onChange={(e) => set({ minOrderUsd: e.target.value })}
                    className={`${inputCls} pl-7`}
                    placeholder="0.00 (no minimum)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Internal note about this coupon..."
              />
            </div>
          </div>

          {/* Usage limits & expiry */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900">Limits & Expiry</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Max Usage</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsage}
                  onChange={(e) => set({ maxUsage: e.target.value })}
                  className={inputCls}
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank for unlimited</p>
              </div>
              <div>
                <label className={labelCls}>Expiry Date</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => set({ expiresAt: e.target.value })}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to never expire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set({ active: !form.active })}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.active ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm text-gray-700">{form.active ? "Active" : "Disabled"}</span>
            </label>
            <p className="text-xs text-gray-400">
              {form.active
                ? "Coupon is live and can be used at checkout"
                : "Coupon is paused and cannot be used"}
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-900 text-sm">
                {form.code || "CODE"}
              </span>
              <span className="text-red-600 font-bold text-sm">
                {form.discountValue
                  ? isPercentage
                    ? `-${form.discountValue}%`
                    : `-$${parseFloat(form.discountValue).toFixed(2)}`
                  : "—"}
              </span>
            </div>
            {form.minOrderUsd && (
              <p className="text-xs text-gray-500">Min order: ${parseFloat(form.minOrderUsd).toFixed(2)}</p>
            )}
            {form.expiresAt && (
              <p className="text-xs text-gray-500">
                Expires: {new Date(form.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : couponId ? "Update Coupon" : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {couponId && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full border border-red-200 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                Delete Coupon
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
