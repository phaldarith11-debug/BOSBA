import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentPageClient } from "./PaymentPageClient";

export default async function PaymentPage({
  params,
}: {
  params: { orderId: string; locale: string };
}) {
  const session = await getServerSession(authOptions);
  const localePrefix = params.locale !== "en" ? `/${params.locale}` : "";
  if (!session?.user?.id) redirect(`${localePrefix}/login?callbackUrl=/payment/${params.orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: params.orderId, userId: session.user.id },
    include: {
      items: { take: 10 },
      deliveryZone: true,
      paymentTxns: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) notFound();

  if (order.paymentStatus === "PAID") {
    redirect(`${localePrefix}/orders/${order.id}`);
  }

  const [wingSetting, wingName] = await Promise.all([
    prisma.settings.findUnique({ where: { key: "wing_account" } }),
    prisma.settings.findUnique({ where: { key: "wing_account_name" } }),
  ]);

  const serialized = {
    id: order.id,
    orderNumber: order.orderNumber,
    totalUsd: Number(order.totalUsd),
    totalKhr: order.totalKhr,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    existingTranId: order.paymentTxns[0]?.tranId ?? null,
    existingQrData: order.paymentTxns[0]?.qrData ?? null,
    existingTxnStatus: order.paymentTxns[0]?.status ?? null,
    existingExpiresAt: order.paymentTxns[0]?.expiresAt?.toISOString() ?? null,
    wingAccount: wingSetting?.value ?? null,
    wingAccountName: wingName?.value ?? null,
  };

  return <PaymentPageClient order={serialized} />;
}
