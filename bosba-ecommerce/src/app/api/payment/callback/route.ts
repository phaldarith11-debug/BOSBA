import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackHash } from "@/lib/payway";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse any representation of a monetary amount to a normalised 2-dp string.
 *  Works with: Prisma Decimal objects, number, string (e.g. "5.00"). */
function toFixed2(val: unknown): string {
  return (Math.round(parseFloat(String(val ?? "0")) * 100) / 100).toFixed(2);
}

/** Returns true only when the ABA-reported amount equals the stored order total
 *  to the cent.  Both values are normalised to 2 dp before comparison so that
 *  Prisma Decimal serialisation ("5.00") and ABA string ("5.00") always match. */
function amountsMatch(abaAmount: unknown, orderTotal: unknown): boolean {
  if (abaAmount == null || orderTotal == null) return false;
  return toFixed2(abaAmount) === toFixed2(orderTotal);
}

// ABA expects exactly this response body whether we act on the callback or not.
// Returning any non-2xx or a body with status≠1 causes ABA to retry indefinitely.
const ABA_OK = NextResponse.json({ status: 1, description: "ok" });

// ─── POST  (ABA server-to-server webhook) ────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.ABA_API_KEY ?? "";

  // 1. Parse form-encoded body into a plain object
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = String(v); });

  // 2. Cryptographic verification — reject anything with an invalid signature
  if (!verifyCallbackHash(params, apiKey)) {
    console.error("[ABA-CALLBACK] Hash verification failed. Raw params:", JSON.stringify(params));
    return NextResponse.json({ status: 0, description: "Invalid hash" }, { status: 400 });
  }

  const tranId  = params.tran_id;
  const abaStatus = (params.status ?? "").toLowerCase();

  if (!tranId) {
    console.error("[ABA-CALLBACK] Missing tran_id in callback params");
    return NextResponse.json({ status: 0, description: "Missing tran_id" }, { status: 400 });
  }

  // 3. Load transaction together with the order total so we can verify amount
  const txn = await prisma.paymentTransaction.findUnique({
    where: { tranId },
    include: { order: { select: { id: true, totalUsd: true } } },
  });

  if (!txn) {
    console.error(`[ABA-CALLBACK] Unknown transaction: tranId=${tranId}`);
    // Return 200-OK so ABA stops retrying an unknown tran_id
    return ABA_OK;
  }

  // ── STEP 1 — Idempotency guard ─────────────────────────────────────────────
  //
  // ABA may fire the same webhook multiple times (network retries, their own
  // retry logic on non-200 responses, manual replays from the merchant portal).
  // If we have already confirmed this transaction we MUST NOT re-process it —
  // doing so could fire duplicate Telegram/admin notifications and corrupt state.
  //
  if (txn.status === "PAID") {
    console.log(
      `[ABA-CALLBACK] Idempotency: tranId=${tranId} already PAID — skipping re-processing`
    );
    return ABA_OK; // Tell ABA we received it; do nothing else
  }

  // Also guard against processing an already-resolved failure / mismatch
  if (txn.status === "FAILED" || txn.status === "AMOUNT_MISMATCH") {
    console.log(
      `[ABA-CALLBACK] Idempotency: tranId=${tranId} already resolved as ${txn.status} — skipping`
    );
    return ABA_OK;
  }

  // ── Approved payment ───────────────────────────────────────────────────────
  if (abaStatus === "0" || abaStatus === "approved") {

    // ── STEP 2 — Amount verification ──────────────────────────────────────────
    //
    // We compare the amount ABA reports as paid (params.amount) against the
    // authoritative order total stored in our DB (order.totalUsd).
    //
    // WHY: A tampered or replayed webhook could carry a lower amount and trick
    // us into confirming a $50 order for $0.01.  The HMAC signature prevents
    // external tampering, but this check defends against operator error, a
    // compromised ABA account, or an edge-case in the PayWay gateway itself.
    //
    const abaAmount    = params.amount;
    const orderTotal   = txn.order.totalUsd;

    if (!amountsMatch(abaAmount, orderTotal)) {
      console.error(
        `[ABA-CALLBACK] AMOUNT MISMATCH — tranId=${tranId} ` +
        `orderId=${txn.order.id} ` +
        `expected=${toFixed2(orderTotal)} USD ` +
        `received=${abaAmount ?? "(not sent)"} USD ` +
        `— transaction flagged AMOUNT_MISMATCH, order NOT confirmed`
      );

      // Mark the transaction suspicious so admin can investigate.
      // Order stays PENDING — payment is NOT confirmed.
      await prisma.paymentTransaction.update({
        where: { tranId },
        data: {
          status: "AMOUNT_MISMATCH",
          rawResponse: JSON.stringify(params),
        },
      });

      // Still return ABA_OK — we do not want ABA to retry indefinitely.
      // The order will remain PENDING and can be resolved manually by admin.
      return ABA_OK;
    }

    // Amount verified ✓ — confirm the payment and advance the order
    await Promise.all([
      prisma.paymentTransaction.update({
        where: { tranId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          rawResponse: JSON.stringify(params),
        },
      }),
      prisma.order.update({
        where: { id: txn.order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      }),
    ]);

    console.log(
      `[ABA-CALLBACK] Payment confirmed — tranId=${tranId} ` +
      `orderId=${txn.order.id} amount=${toFixed2(orderTotal)} USD`
    );

  } else {
    // Non-approved status (customer cancelled, QR expired, etc.)
    await prisma.paymentTransaction.update({
      where: { tranId },
      data: { status: "FAILED", rawResponse: JSON.stringify(params) },
    });

    console.log(
      `[ABA-CALLBACK] Payment not approved — tranId=${tranId} abaStatus=${abaStatus}`
    );
  }

  return ABA_OK;
}

// ─── GET  (ABA return_url redirect after checkout) ───────────────────────────

export async function GET(req: NextRequest) {
  const tranId = req.nextUrl.searchParams.get("tran_id");
  if (!tranId) return NextResponse.redirect(new URL("/", req.url));

  const txn = await prisma.paymentTransaction.findUnique({ where: { tranId } });
  if (!txn) return NextResponse.redirect(new URL("/", req.url));

  // Redirect customer to their order status page
  return NextResponse.redirect(new URL(`/payment/${txn.orderId}`, req.url));
}
