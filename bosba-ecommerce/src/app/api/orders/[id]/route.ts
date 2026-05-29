import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  buildCustomerStatusMessage,
  buildAdminStatusMessage,
} from "@/lib/telegram";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.trackingCode !== undefined && { trackingCode: data.trackingCode }),
      ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
    },
    include: {
      user: { select: { name: true, phone: true, telegramChatId: true } },
    },
  });

  const statusChanged = data.status !== undefined;
  const trackingAdded = data.trackingCode !== undefined && data.trackingCode !== null;

  if (statusChanged || trackingAdded) {
    // Notify admin channel
    sendTelegramMessage(
      buildAdminStatusMessage({
        orderNumber: order.orderNumber,
        user: order.user,
        status: order.status,
        trackingCode: order.trackingCode,
      })
    );

    // Notify customer on their own Telegram if linked
    if (order.user.telegramChatId && statusChanged) {
      sendTelegramMessage(
        buildCustomerStatusMessage({
          orderNumber: order.orderNumber,
          status: order.status,
          trackingCode: order.trackingCode,
          totalUsd: Number(order.totalUsd),
          totalKhr: order.totalKhr,
        }),
        order.user.telegramChatId
      );
    }
  }

  return NextResponse.json(order);
}
