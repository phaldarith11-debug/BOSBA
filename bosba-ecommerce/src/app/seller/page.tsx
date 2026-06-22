"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package, ShoppingCart, BarChart3, Boxes, Wallet, UserCircle, ArrowRight,
  DollarSign, AlertTriangle, Loader2,
} from "lucide-react";

const CARDS = [
  { href: "/seller/products", icon: Package, label: "My Products", desc: "Create and manage your catalog" },
  { href: "/seller/orders", icon: ShoppingCart, label: "My Orders", desc: "Fulfil orders for your products" },
  { href: "/seller/sales", icon: BarChart3, label: "Sales", desc: "Track revenue and performance" },
  { href: "/seller/stock", icon: Boxes, label: "Stock", desc: "Monitor and update inventory" },
  { href: "/seller/payments", icon: Wallet, label: "Payments", desc: "Payouts and commission" },
  { href: "/seller/profile", icon: UserCircle, label: "Business Profile", desc: "Your store details" },
];

interface Overview {
  productCount: number;
  activeCount: number;
  lowStock: number;
  orderCount: number;
  unitsSold: number;
  revenueUsd: number;
  pendingPayoutUsd: number;
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Revenue", value: data ? `$${data.revenueUsd.toFixed(2)}` : "—", icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Orders", value: data?.orderCount ?? "—", icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
    { label: "Products", value: data ? `${data.activeCount}/${data.productCount}` : "—", icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { label: "Low stock", value: data?.lowStock ?? "—", icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
    { label: "Pending payout", value: data ? `$${data.pendingPayoutUsd.toFixed(2)}` : "—", icon: Wallet, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Center</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your products, orders, and payouts.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-300" /> : s.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {data && data.productCount === 0 && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <span>You have no products yet. Add your first product to start selling.</span>
          <Link href="/seller/products/new" className="font-semibold underline whitespace-nowrap">Add product →</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-emerald-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
