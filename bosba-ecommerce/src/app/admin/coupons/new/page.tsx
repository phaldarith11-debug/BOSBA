import { CouponForm } from "@/components/admin/CouponForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/coupons" className="hover:text-gray-900">Coupons</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">New Coupon</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
        <p className="text-sm text-gray-500 mt-1">Create a discount coupon for customers</p>
      </div>
      <CouponForm />
    </div>
  );
}
