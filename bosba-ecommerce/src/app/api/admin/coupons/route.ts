import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "MANAGER";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderUsd, maxUsage, expiresAt, active } = body;

  if (!code || !discountType || discountValue === undefined) {
    return NextResponse.json({ error: "code, discountType and discountValue are required" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      description: description || null,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderUsd: minOrderUsd ? parseFloat(minOrderUsd) : null,
      maxUsage: maxUsage ? parseInt(maxUsage) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}

