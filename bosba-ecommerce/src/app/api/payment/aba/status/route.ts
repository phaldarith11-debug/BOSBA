import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkABATransaction } from "@/lib/payway";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tranId = req.nextUrl.searchParams.get("tranId");
  if (!tranId) return NextResponse.json({ error: "Missing tranId" }, { status: 400 });

  // Look up our local record
  const txn = await prisma.paymentTransaction.findUnique({
    where: { tranId },
    include: { order: { select: { userId: true, id: true } } },
  });

  if (!txn || txn.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Already resolved — return cached state
  if (txn.status === "PAID") return NextResponse.json({ status: "PAID" });
  if (txn.status === "FAILED") return NextResponse.json({ status: "FAILED" });

  // Check expiry
  if (txn.expiresAt && txn.expiresAt < new Date()) {
    await prisma.paymentTransaction.update({ where: { tranId }, data: { status: "EXPIRED" } });
    return NextResponse.json({ status: "EXPIRED" });
  }

  // Ask PayWay
  const { status, raw } = await checkABATransaction(tranId);

  if (status === "PAID") {
    await Promise.all([
      prisma.paymentTransaction.update({
        where: { tranId },
        data: { status: "PAID", paidAt: new Date(), rawResponse: JSON.stringify(raw) },
      }),
      prisma.order.update({
        where: { id: txn.order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      }),
    ]);
    return NextResponse.json({ status: "PAID" });
  }

  if (status === "FAILED") {
    await prisma.paymentTransaction.update({
      where: { tranId },
      data: { status: "FAILED", rawResponse: JSON.stringify(raw) },
    });
    return NextResponse.json({ status: "FAILED" });
  }

  return NextResponse.json({ status: "PENDING" });
}
