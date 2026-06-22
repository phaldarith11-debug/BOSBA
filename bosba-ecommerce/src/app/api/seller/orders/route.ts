import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

/**
 * Orders that include at least one of THIS seller's products. Each order is
 * trimmed to only the seller's line items plus a seller-specific subtotal, so a
 * vendor never sees another vendor's products inside a shared cart/order.
 */
export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: seller.sellerId } } } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: {
        where: { product: { sellerId: seller.sellerId } },
        include: { product: { select: { nameEn: true, images: true } } },
      },
    },
  });

  const shaped = orders.map((o) => {
    const sellerSubtotal = o.items.reduce(
      (sum, it) => sum + Number(it.priceUsd) * it.quantity,
      0
    );
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemCount: o.items.reduce((n, it) => n + it.quantity, 0),
      sellerSubtotalUsd: Number(sellerSubtotal.toFixed(2)),
      items: o.items.map((it) => ({
        id: it.id,
        nameEn: it.product?.nameEn ?? it.nameEn,
        image: it.product?.images?.[0] ?? null,
        quantity: it.quantity,
        priceUsd: Number(it.priceUsd),
      })),
    };
  });

  return NextResponse.json({ orders: shaped });
}
