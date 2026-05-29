import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const subtotal = parseFloat(req.nextUrl.searchParams.get("subtotal") ?? "0");

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase(), active: true },
  });

  if (!coupon) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
  }
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
  }
  if (coupon.minOrderUsd && subtotal < Number(coupon.minOrderUsd)) {
    return NextResponse.json({ error: `Minimum order $${coupon.minOrderUsd} required` }, { status: 400 });
  }

  let discountUsd = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountUsd = (subtotal * Number(coupon.discountValue)) / 100;
  } else {
    discountUsd = Math.min(Number(coupon.discountValue), subtotal);
  }

  return NextResponse.json({ discountUsd, code: coupon.code, description: coupon.description });
}
