"use client";
import { useEffect, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";

interface SellerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
  sellerSubtotalUsd: number;
  items: { id: string; nameEn: string; image: string | null; quantity: number; priceUsd: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Orders that include your products. You only see your own line items.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
          <ShoppingCart className="h-10 w-10 mb-3" />
          <p className="text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">#{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                  <span className="text-sm font-bold text-gray-900">${o.sellerSubtotalUsd.toFixed(2)}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {o.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="flex-1 text-sm text-gray-700">{it.nameEn}</span>
                    <span className="text-xs text-gray-400">×{it.quantity}</span>
                    <span className="text-sm text-gray-600 w-16 text-right">${(it.priceUsd * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
