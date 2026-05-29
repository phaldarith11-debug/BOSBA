"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Truck, Phone, CheckCircle } from "lucide-react";

interface Props {
  order: { id: string; orderNumber: string; totalUsd: number; totalKhr: number };
}

export function CODConfirmation({ order }: Props) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          router.push(`/orders/${order.id}`);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [order.id, router]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 text-center">
        <CheckCircle className="h-12 w-12 mx-auto mb-2" />
        <h2 className="text-xl font-bold">Order Confirmed!</h2>
        <p className="text-green-100 text-sm mt-1">Cash on Delivery selected</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="text-center">
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${order.totalUsd.toFixed(2)}</p>
          <p className="text-sm text-gray-400">≈ ៛{order.totalKhr.toLocaleString()}</p>
          <p className="text-xs font-medium text-green-600 mt-1">Pay when your order arrives</p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Package, title: "Order Received", desc: "We're preparing your items" },
            { icon: Truck, title: "Delivery", desc: "A rider will bring your order" },
            { icon: Phone, title: "Pay on Arrival", desc: "Pay cash to the delivery person" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg flex-shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-400">
          Redirecting to your order in <strong className="text-gray-700">{seconds}s</strong>…
        </div>

        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition-colors"
        >
          View My Order
        </button>
      </div>
    </div>
  );
}
