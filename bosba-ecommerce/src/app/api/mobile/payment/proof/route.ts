import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId } from "@/lib/mobile-auth";
import { uploadImage } from "@/lib/cloudinary";
import { sendTelegramMessage } from "@/lib/telegram";

// Mobile customer submits manual payment proof for their own order.
// Accepts multipart/form-data: { orderId, refId?, file? }.
export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const refId = String(form.get("refId") ?? "").trim();

    let screenshotUrl: string | null = null;
    const file = form.get("file");
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const base64 = `data:${file.type || "image/jpeg"};base64,${Buffer.from(bytes).toString("base64")}`;
      screenshotUrl = await uploadImage(base64, "bosba/payment-proofs");
    }

    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    if (!refId && !screenshotUrl) {
      return NextResponse.json(
        { error: "Please provide a transaction reference or upload a screenshot." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
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
        paymentRejectReason: null,
      },
    });

    sendTelegramMessage(
      [
        `🧾 <b>Payment proof submitted (mobile)</b>`,
        `Order #${updated.orderNumber}`,
        `Amount: $${Number(updated.totalUsd).toFixed(2)}`,
        refId ? `Ref: <code>${refId}</code>` : null,
        screenshotUrl ? `Screenshot attached ✅` : null,
      ]
        .filter(Boolean)
        .join("\n")
    );

    return NextResponse.json({ success: true, status: updated.status, proofUrl: screenshotUrl });
  } catch (err) {
    console.error("POST /api/mobile/payment/proof failed:", err);
    const message = err instanceof Error ? err.message : "Failed to submit payment proof";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
