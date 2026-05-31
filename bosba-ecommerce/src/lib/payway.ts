import crypto from "crypto";

const PAYWAY_BASE =
  process.env.ABA_PAYWAY_URL ??
  "https://checkout.payway.com.kh/api/payment-gateway/v1/payments";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayWayItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateTransactionParams {
  tranId: string;
  amount: number;
  currency?: "USD" | "KHR";
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
  items?: PayWayItem[];
}

export interface CreateTransactionResult {
  success: boolean;
  qrData?: string;      // KHQR / EMVCo string to render as QR image
  tranId: string;
  error?: string;
  raw?: unknown;
}

export type TxnStatus = "PENDING" | "PAID" | "FAILED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reqTime(): string {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0")
  );
}

function hmacB64(data: string, key: string): string {
  return crypto.createHmac("sha512", key).update(data).digest("base64");
}

function credentials() {
  const id = process.env.ABA_MERCHANT_ID;
  const key = process.env.ABA_API_KEY;
  if (!id || !key) throw new Error("ABA_MERCHANT_ID / ABA_API_KEY not set");
  return { id, key };
}

// ─── Create transaction (returns KHQR string) ─────────────────────────────────

export async function createABATransaction(
  params: CreateTransactionParams
): Promise<CreateTransactionResult> {
  const { id: merchantId, key: apiKey } = credentials();

  const rt = reqTime();
  const amount = params.amount.toFixed(2);
  const items = params.items?.length
    ? JSON.stringify(params.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price.toFixed(2) })))
    : "";
  const shipping = "0";
  const continueUrl = params.returnUrl;
  const paymentOption = "abapay_khqr";

  // Hash string — order exactly as in ABA PayWay v1 docs
  const hashStr =
    rt +
    merchantId +
    params.tranId +
    amount +
    items +
    params.firstname +
    params.lastname +
    params.phone +
    params.email +
    shipping +
    params.returnUrl +
    params.cancelUrl +
    continueUrl +
    paymentOption;

  const hash = hmacB64(hashStr, apiKey);

  const body = new URLSearchParams({
    req_time: rt,
    merchant_id: merchantId,
    tran_id: params.tranId,
    amount,
    payment_option: paymentOption,
    currency: params.currency ?? "USD",
    firstname: params.firstname,
    lastname: params.lastname,
    phone: params.phone,
    email: params.email,
    shipping,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    continue_success_url: continueUrl,
    hash,
  });

  if (items) body.set("items", items);

  const res = await fetch(`${PAYWAY_BASE}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    // Allow self-signed certs in dev if needed
  });

  const raw = await res.json().catch(() => null);

  // PayWay returns code "0" (string) for success
  const code = String(raw?.status?.code ?? raw?.code ?? "1");
  if (code === "0") {
    const qrData: string | undefined =
      raw?.data?.qr ??
      raw?.data?.qrData ??
      raw?.qr ??
      raw?.qrImage;
    return { success: true, qrData, tranId: params.tranId, raw };
  }

  return {
    success: false,
    tranId: params.tranId,
    error: raw?.status?.message ?? raw?.message ?? "PayWay request failed",
    raw,
  };
}

// ─── Check transaction status ─────────────────────────────────────────────────

export async function checkABATransaction(tranId: string): Promise<{
  status: TxnStatus;
  raw?: unknown;
}> {
  const { id: merchantId, key: apiKey } = credentials();
  const rt = reqTime();

  const hashStr = rt + merchantId + tranId;
  const hash = hmacB64(hashStr, apiKey);

  const body = new URLSearchParams({
    req_time: rt,
    merchant_id: merchantId,
    tran_id: tranId,
    hash,
  });

  const res = await fetch(`${PAYWAY_BASE}/check-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await res.json().catch(() => null);
  const code = String(raw?.status?.code ?? raw?.code ?? "1");
  if (code !== "0") return { status: "PENDING", raw };

  const txnStatus = (raw?.data?.status ?? raw?.status?.message ?? "").toLowerCase();
  if (txnStatus === "approved" || txnStatus === "success") return { status: "PAID", raw };
  if (txnStatus === "failed" || txnStatus === "declined" || txnStatus === "cancelled") {
    return { status: "FAILED", raw };
  }
  return { status: "PENDING", raw };
}

// ─── Validate PayWay webhook callback ─────────────────────────────────────────

export function verifyCallbackHash(params: Record<string, string>, apiKey: string): boolean {
  // ABA sends: tran_id, status, apv, payment_option, hash
  const { hash, ...rest } = params;
  if (!hash) return false;
  const hashStr = Object.values(rest).join("");
  const expected = hmacB64(hashStr, apiKey);
  return expected === hash;
}
