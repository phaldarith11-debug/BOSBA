import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin-only: manually mark Wing Money (or other manual) payments as paid
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, note } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { paymentTxns: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await Promise.all([
    prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        notes: note ? `${order.notes ?? ""}\n[Admin confirmed payment: ${note}]`.trim() : order.notes,
      },
    }),
    order.paymentTxns[0]
      ? prisma.paymentTransaction.update({
          where: { id: order.paymentTxns[0].id },
          data: { status: "PAID", paidAt: new Date() },
        })
      : prisma.paymentTransaction.create({
          data: {
            orderId,
            provider: order.paymentMethod,
            tranId: `manual-${orderId}`,
            status: "PAID",
            paidAt: new Date(),
          },
        }),
  ]);

  return NextResponse.json({ success: true });
}
