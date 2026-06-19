import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { sendTelegramMessage } from "@/lib/telegram";

// Customer submits manual payment proof for their own order.
// Accepts multipart/form-data: { orderId, refId?, file? }.
// At least one of refId or file is required.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orderId = "";
  let refId = "";
  let screenshotUrl: string | null = null;

  try {
    const form = await req.formData();
    orderId = String(form.get("orderId") ?? "");
    refId = String(form.get("refId") ?? "").trim();

    const file = form.get("file");
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
      screenshotUrl = await uploadImage(base64, "bosba/payment-proofs");
    }

    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    if (!refId && !screenshotUrl) {
      return NextResponse.json(
        { error: "Please provide a transaction reference or upload a screenshot." },
        { status: 400 }
      );
    }

    // Only the order owner can submit proof, and only while payment is pending.
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAYMENT_SUBMITTED",
        paymentRefId: refId || order.paymentRefId,
        paymentProofUrl: screenshotUrl ?? order.paymentProofUrl,
        paymentSubmittedAt: new Date(),
        paymentRejectReason: null, // clear any prior rejection on resubmit
      },
    });

    // Notify admin channel (fire-and-forget; never blocks the customer).
    sendTelegramMessage(
      [
        `🧾 <b>Payment proof submitted</b>`,
        `Order #${updated.orderNumber}`,
        `Amount: $${Number(updated.totalUsd).toFixed(2)}`,
        refId ? `Ref: <code>${refId}</code>` : null,
        screenshotUrl ? `Screenshot attached ✅` : null,
        `Review it in the admin → Payments queue.`,
      ]
        .filter(Boolean)
        .join("\n")
    );

    return NextResponse.json({ success: true, status: updated.status, proofUrl: screenshotUrl });
  } catch (err) {
    console.error("POST /api/payment/proof failed:", err);
    const message = err instanceof Error ? err.message : "Failed to submit payment proof";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
