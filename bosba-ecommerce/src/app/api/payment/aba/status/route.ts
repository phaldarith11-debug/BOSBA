import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkABATransaction } from "@/lib/payway";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise any monetary value to a 2-dp string for safe comparison. */
function toFixed2(val: unknown): string {
  return (Math.round(parseFloat(String(val ?? "0")) * 100) / 100).toFixed(2);
}

/** True when the ABA-reported amount equals the stored order total to the cent. */
function amountsMatch(abaAmount: unknown, orderTotal: unknown): boolean {
  if (abaAmount == null || orderTotal == null) return false;
  return toFixed2(abaAmount) === toFixed2(orderTotal);
}

// ─── GET  (frontend polling) ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tranId = req.nextUrl.searchParams.get("tranId");
  if (!tranId) return NextResponse.json({ error: "Missing tranId" }, { status: 400 });

  // Load our local record; also select totalUsd so we can verify the amount
  const txn = await prisma.paymentTransaction.findUnique({
    where: { tranId },
    include: {
      order: { select: { userId: true, id: true, totalUsd: true } },
    },
  });

  // Ownership check — a user must not be able to poll someone else's payment
  if (!txn || txn.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── Idempotency: already-resolved states are returned from cache ────────────
  //
  // This path is the polling counterpart to the webhook idempotency guard.
  // If the webhook already confirmed PAID before the next poll fires, we skip
  // any further ABA call and return the cached state immediately.
  //
  if (txn.status === "PAID")   return NextResponse.json({ status: "PAID"   });
  if (txn.status === "FAILED") return NextResponse.json({ status: "FAILED" });

  // Surface amount-mismatch to the frontend so the customer can contact support
  if (txn.status === "AMOUNT_MISMATCH") {
    return NextResponse.json({ status: "FAILED", reason: "amount_mismatch" });
  }

  // EXPIRED check (QR past its 10-minute window)
  if (txn.expiresAt && txn.expiresAt < new Date()) {
    await prisma.paymentTransaction.update({
      where: { tranId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ status: "EXPIRED" });
  }

  // ── Live check against ABA PayWay ─────────────────────────────────────────
  const { status, raw } = await checkABATransaction(tranId);

  if (status === "PAID") {
    // ── STEP 2 — Amount verification on polling path ───────────────────────
    //
    // The check-transaction response carries the confirmed amount in
    // raw.data.amount.  We verify it matches our Order.totalUsd before
    // marking the payment as confirmed.
    //
    // Note: raw is typed as `unknown`; we access it via a cast.  The shape
    // comes from ABA's API — { status: {...}, data: { amount, status, ... } }.
    //
    const rawData = (raw as { data?: { amount?: unknown } } | null)?.data;
    const abaAmount  = rawData?.amount;
    const orderTotal = txn.order.totalUsd;

    if (!amountsMatch(abaAmount, orderTotal)) {
      console.error(
        `[ABA-STATUS] AMOUNT MISMATCH — tranId=${tranId} ` +
        `orderId=${txn.order.id} ` +
        `expected=${toFixed2(orderTotal)} USD ` +
        `received=${abaAmount ?? "(not in response)"} USD ` +
        `— transaction flagged AMOUNT_MISMATCH, order NOT confirmed`
      );

      await prisma.paymentTransaction.update({
        where: { tranId },
        data: {
          status: "AMOUNT_MISMATCH",
          rawResponse: JSON.stringify(raw),
        },
      });

      // Return FAILED with a reason code so the frontend can show a clear message
      return NextResponse.json({ status: "FAILED", reason: "amount_mismatch" });
    }

    // Amount verified ✓ — confirm the payment
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

    console.log(
      `[ABA-STATUS] Payment confirmed via polling — tranId=${tranId} ` +
      `orderId=${txn.order.id} amount=${toFixed2(orderTotal)} USD`
    );

    return NextResponse.json({ status: "PAID" });
  }

  if (status === "FAILED") {
    await prisma.paymentTransaction.update({
      where: { tranId },
      data: { status: "FAILED", rawResponse: JSON.stringify(raw) },
    });
    return NextResponse.json({ status: "FAILED" });
  }

  // Still pending — frontend will poll again
  return NextResponse.json({ status: "PENDING" });
}
