import { NextRequest, NextResponse } from "next/server";
import { Prisma, type PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMobileUserId } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      totalUsd: true,
      createdAt: true,
      items: {
        select: { nameEn: true, quantity: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items, address, deliveryZoneId, paymentMethod, currency } = body;

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: "items and paymentMethod are required" }, { status: 400 });
  }

  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let subtotalUsd = 0;
  const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = items.map(
    (item: { productId: string; quantity: number }) => {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p) throw new Error(`Product ${item.productId} not found`);
      const lineUsd = Number(p.priceUsd) * item.quantity;
      subtotalUsd += lineUsd;
      return {
        product: { connect: { id: p.id } },
        nameEn: p.nameEn,
        nameKm: p.nameKm,
        priceUsd: p.priceUsd,
        priceKhr: p.priceKhr,
        quantity: item.quantity,
        totalUsd: lineUsd,
        totalKhr: p.priceKhr * item.quantity,
        imageUrl: p.images[0] ?? null,
      };
    }
  );

  let deliveryFeeUsd = 0;
  let deliveryFeeKhr = 0;
  if (deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
    if (zone) { deliveryFeeUsd = Number(zone.priceUsd); deliveryFeeKhr = zone.priceKhr; }
  }

  const exchangeRate = 4100;
  const totalUsd = subtotalUsd + deliveryFeeUsd;
  const orderNumber = `BS${Date.now()}`;

  // Nested relation writes require the *checked* Prisma input, so foreign keys are
  // expressed as `connect`/`create` relations — not scalar `userId`/`deliveryZoneId`.
  const addressCreate: Prisma.AddressCreateWithoutOrdersInput | undefined = address
    ? {
        user: { connect: { id: userId } },
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        city: address.city,
        province: address.province,
        district: address.district || null,
        commune: address.commune || null,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        ...(deliveryZoneId ? { deliveryZone: { connect: { id: deliveryZoneId } } } : {}),
      }
    : undefined;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      user: { connect: { id: userId } },
      paymentMethod: paymentMethod as PaymentMethod,
      subtotalUsd,
      subtotalKhr: Math.round(subtotalUsd * exchangeRate),
      deliveryFeeUsd,
      deliveryFeeKhr,
      totalUsd,
      totalKhr: Math.round(totalUsd * exchangeRate),
      exchangeRate,
      currency: currency ?? "USD",
      notes: body.notes ?? null,
      ...(deliveryZoneId ? { deliveryZone: { connect: { id: deliveryZoneId } } } : {}),
      ...(addressCreate ? { address: { create: addressCreate } } : {}),
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
