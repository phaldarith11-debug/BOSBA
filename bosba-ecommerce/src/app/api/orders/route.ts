import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  buildNewOrderMessage,
  buildLowStockMessage,
  LOW_STOCK_THRESHOLD,
} from "@/lib/telegram";
import { usdToKhr } from "@/lib/currency";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BO-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items, addressData, deliveryZoneId, paymentMethod, couponCode, notes, exchangeRate = 4100 } = body;

  const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
  if (!zone) return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });

  let coupon = null;
  let discountUsd = 0;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode, active: true } });
    if (coupon) {
      if (coupon.discountType === "PERCENTAGE") {
        discountUsd = (body.subtotalUsd * Number(coupon.discountValue)) / 100;
      } else {
        discountUsd = Number(coupon.discountValue);
      }
    }
  }

  const subtotalUsd = body.subtotalUsd;
  const deliveryFeeUsd =
    zone.freeOverUsd && subtotalUsd >= Number(zone.freeOverUsd)
      ? 0
      : Number(zone.priceUsd);
  const totalUsd = subtotalUsd + deliveryFeeUsd - discountUsd;

  let addressId: string | undefined;
  let savedAddress: { province?: string | null } | null = null;
  if (addressData) {
    const created = await prisma.address.create({
      data: { ...addressData, userId: session.user.id, deliveryZoneId },
    });
    savedAddress = created;
    addressId = created.id;
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      addressId,
      deliveryZoneId,
      couponId: coupon?.id,
      paymentMethod,
      subtotalUsd,
      subtotalKhr: usdToKhr(subtotalUsd, exchangeRate),
      deliveryFeeUsd,
      deliveryFeeKhr: usdToKhr(deliveryFeeUsd, exchangeRate),
      discountUsd,
      discountKhr: usdToKhr(discountUsd, exchangeRate),
      totalUsd,
      totalKhr: usdToKhr(totalUsd, exchangeRate),
      exchangeRate,
      notes,
      items: {
        create: items.map((item: { productId: string; nameEn: string; nameKm?: string; priceUsd: number; priceKhr: number; quantity: number; imageUrl?: string }) => ({
          productId: item.productId,
          nameEn: item.nameEn,
          nameKm: item.nameKm,
          priceUsd: item.priceUsd,
          priceKhr: item.priceKhr,
          quantity: item.quantity,
          totalUsd: item.priceUsd * item.quantity,
          totalKhr: usdToKhr(item.priceUsd * item.quantity, exchangeRate),
          imageUrl: item.imageUrl,
        })),
      },
    },
    include: { user: true, items: true, deliveryZone: true },
  });

  if (coupon) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
  }

  // Decrement stock and collect products that dropped below threshold
  const lowStockProducts: Array<{ nameEn: string; sku: string | null; stock: number }> = [];
  for (const item of items) {
    const updated = await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
      select: { nameEn: true, sku: true, stock: true },
    });
    if (updated.stock <= LOW_STOCK_THRESHOLD) {
      lowStockProducts.push(updated);
    }
  }

  // Admin: rich new-order notification
  await sendTelegramMessage(
    buildNewOrderMessage({
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items.map((i) => ({
        nameEn: i.nameEn,
        quantity: i.quantity,
        priceUsd: Number(i.priceUsd),
      })),
      subtotalUsd: Number(order.subtotalUsd),
      deliveryFeeUsd: Number(order.deliveryFeeUsd),
      discountUsd: Number(order.discountUsd),
      totalUsd: Number(order.totalUsd),
      totalKhr: order.totalKhr,
      paymentMethod: order.paymentMethod,
      deliveryZone: order.deliveryZone,
      address: savedAddress,
    })
  );

  // Admin: low stock alert (fire-and-forget, don't await in series)
  if (lowStockProducts.length > 0) {
    sendTelegramMessage(buildLowStockMessage(lowStockProducts));
  }

  return NextResponse.json(order, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, deliveryZone: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
