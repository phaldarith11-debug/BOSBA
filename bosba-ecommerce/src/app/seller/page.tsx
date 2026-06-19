import Link from "next/link";
import {
  Package, ShoppingCart, BarChart3, Boxes, Wallet, UserCircle, ArrowRight,
} from "lucide-react";

const CARDS = [
  { href: "/seller/products", icon: Package, label: "My Products", desc: "Create and manage your catalog" },
  { href: "/seller/orders", icon: ShoppingCart, label: "My Orders", desc: "Fulfil orders for your products" },
  { href: "/seller/sales", icon: BarChart3, label: "Sales", desc: "Track revenue and performance" },
  { href: "/seller/stock", icon: Boxes, label: "Stock", desc: "Monitor and update inventory" },
  { href: "/seller/payments", icon: Wallet, label: "Payments", desc: "Payouts and commission" },
  { href: "/seller/profile", icon: UserCircle, label: "Business Profile", desc: "Your store details" },
];

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your products, orders, and payouts. Full vendor features arrive in Milestone 2.
        </p>
      </div>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
        Your seller workspace is ready. The sections below will connect to your own products and
        orders once the marketplace data model lands.
      </div>

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
