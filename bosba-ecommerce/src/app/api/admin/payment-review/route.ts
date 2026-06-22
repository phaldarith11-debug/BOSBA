import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

// Admin approves or rejects a manually submitted ABA/KHQR payment.
// Body: { orderId, action: "approve" | "reject", reason? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, action, reason } = await req.json();
    if (!orderId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "orderId and a valid action are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { telegramChatId: true } },
        paymentTxns: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (action === "approve") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            paymentReviewedAt: new Date(),
            paymentRejectReason: null,
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
                tranId: order.paymentRefId || `manual-${orderId}`,
                status: "PAID",
                paidAt: new Date(),
              },
            }),
      ]);

      if (order.user.telegramChatId) {
        sendTelegramMessage(
          `✅ <b>Payment Confirmed</b>\nOrder #${order.orderNumber} — $${Number(order.totalUsd).toFixed(2)}\nThank you! We are now preparing your order.`,
          order.user.telegramChatId
        );
      }
      return NextResponse.json({ success: true, status: "PAID" });
    }

    // action === "reject"
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_REJECTED",
        paymentReviewedAt: new Date(),
        paymentRejectReason: typeof reason === "string" && reason.trim() ? reason.trim() : "Payment could not be verified.",
      },
    });

    if (order.user.telegramChatId) {
      sendTelegramMessage(
        `❌ <b>Payment Not Verified</b>\nOrder #${order.orderNumber}\n${reason?.trim() || "We could not verify your payment."}\nPlease re-submit your payment proof.`,
        order.user.telegramChatId
      );
    }
    return NextResponse.json({ success: true, status: "PAYMENT_REJECTED" });
  } catch (err) {
    console.error("POST /api/admin/payment-review failed:", err);
    const message = err instanceof Error ? err.message : "Failed to review payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
