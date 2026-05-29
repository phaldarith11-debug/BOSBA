import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackHash } from "@/lib/payway";

// ABA PayWay server-to-server callback — fires after QR is scanned and paid
export async function POST(req: NextRequest) {
  const apiKey = process.env.ABA_API_KEY ?? "";

  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = String(v); });

  if (!verifyCallbackHash(params, apiKey)) {
    return NextResponse.json({ status: 0, description: "Invalid hash" }, { status: 400 });
  }

  const tranId = params.tran_id;
  const status = (params.status ?? "").toLowerCase();

  if (!tranId) return NextResponse.json({ status: 0, description: "Missing tran_id" }, { status: 400 });

  const txn = await prisma.paymentTransaction.findUnique({ where: { tranId } });
  if (!txn) return NextResponse.json({ status: 0, description: "Unknown transaction" }, { status: 404 });

  if (status === "0" || status === "approved") {
    // "0" means success in ABA callback
    await Promise.all([
      prisma.paymentTransaction.update({
        where: { tranId },
        data: { status: "PAID", paidAt: new Date(), rawResponse: JSON.stringify(params) },
      }),
      prisma.order.update({
        where: { id: txn.orderId },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      }),
    ]);
  } else {
    await prisma.paymentTransaction.update({
      where: { tranId },
      data: { status: "FAILED", rawResponse: JSON.stringify(params) },
    });
  }

  // ABA expects this exact response
  return NextResponse.json({ status: 1, description: "ok" });
}

// ABA also calls GET for return_url redirects
export async function GET(req: NextRequest) {
  const tranId = req.nextUrl.searchParams.get("tran_id");
  if (!tranId) return NextResponse.redirect(new URL("/", req.url));

  const txn = await prisma.paymentTransaction.findUnique({ where: { tranId } });
  if (!txn) return NextResponse.redirect(new URL("/", req.url));

  // Redirect customer to their order page
  return NextResponse.redirect(new URL(`/payment/${txn.orderId}`, req.url));
}
