import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/CouponForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) notFound();

  const initialValues = {
    code: coupon.code,
    description: coupon.description ?? "",
    discountType: coupon.discountType,
    discountValue: String(Number(coupon.discountValue)),
    minOrderUsd: coupon.minOrderUsd ? String(Number(coupon.minOrderUsd)) : "",
    maxUsage: coupon.maxUsage ? String(coupon.maxUsage) : "",
    expiresAt: coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "",
    active: coupon.active,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/coupons" className="hover:text-gray-900">Coupons</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{coupon.code}</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
        <p className="text-sm text-gray-500 mt-1">
          Used {coupon.usageCount} time{coupon.usageCount !== 1 ? "s" : ""}
          {coupon.maxUsage ? ` out of ${coupon.maxUsage}` : ""}
        </p>
      </div>
      <CouponForm initialValues={initialValues} couponId={coupon.id} />
    </div>
  );
}
