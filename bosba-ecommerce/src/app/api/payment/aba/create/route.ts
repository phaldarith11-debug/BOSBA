import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createABATransaction } from "@/lib/payway";
import { ABA_PAYWAY_ENABLED } from "@/lib/aba";

export async function POST(req: NextRequest) {
  // Automatic ABA PayWay is paused. The manual ABA/KHQR proof flow is used
  // instead (see /api/payment/proof). Flip ABA_PAYWAY_ENABLED=true to re-enable.
  if (!ABA_PAYWAY_ENABLED) {
    return NextResponse.json(
      { error: "Automatic ABA PayWay is currently disabled. Please use manual ABA transfer.", disabled: true },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: {
      user: true,
      items: { take: 5 },
      paymentTxns: { where: { status: { in: ["PENDING", "PAID"] } }, take: 1 },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Return existing pending transaction if it hasn't expired
  const existing = order.paymentTxns[0];
  if (existing?.status === "PAID") {
    return NextResponse.json({ alreadyPaid: true, tranId: existing.tranId });
  }
  if (existing?.status === "PENDING" && existing.expiresAt && existing.expiresAt > new Date()) {
    return NextResponse.json({ tranId: existing.tranId, qrData: existing.qrData });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const user = order.user;
  const nameParts = (user.name ?? "BOSBA Customer").split(" ");

  const result = await createABATransaction({
    tranId: order.orderNumber,
    amount: Number(order.totalUsd),
    currency: "USD",
    firstname: nameParts[0] ?? "Customer",
    lastname: nameParts.slice(1).join(" ") || ".",
    phone: user.phone ?? "855000000000",
    email: user.email,
    returnUrl: `${baseUrl}/api/payment/callback`,
    cancelUrl: `${baseUrl}/payment/${orderId}`,
    items: order.items.map((i) => ({
      name: i.nameEn,
      quantity: i.quantity,
      price: Number(i.priceUsd),
    })),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to create payment" },
      { status: 502 }
    );
  }

  // Store transaction (upsert by tranId)
  await prisma.paymentTransaction.upsert({
    where: { tranId: order.orderNumber },
    create: {
      orderId: order.id,
      provider: order.paymentMethod,
      tranId: order.orderNumber,
      qrData: result.qrData ?? null,
      status: "PENDING",
      rawResponse: JSON.stringify(result.raw),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
    update: {
      qrData: result.qrData ?? null,
      status: "PENDING",
      rawResponse: JSON.stringify(result.raw),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ tranId: result.tranId, qrData: result.qrData });
}
