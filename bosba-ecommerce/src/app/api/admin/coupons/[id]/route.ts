import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "MANAGER";
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderUsd, maxUsage, expiresAt, active } = body;

  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      ...(code !== undefined && { code: code.toUpperCase().trim() }),
      ...(description !== undefined && { description: description || null }),
      ...(discountType !== undefined && { discountType }),
      ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
      ...(minOrderUsd !== undefined && { minOrderUsd: minOrderUsd ? parseFloat(minOrderUsd) : null }),
      ...(maxUsage !== undefined && { maxUsage: maxUsage ? parseInt(maxUsage) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(coupon);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupon = await prisma.coupon.findUnique({ where: { id: params.id }, include: { _count: { select: { orders: true } } } });
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (coupon._count.orders > 0) return NextResponse.json({ error: "Cannot delete a coupon that has been used in orders" }, { status: 409 });

  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
