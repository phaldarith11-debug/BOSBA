import { prisma } from "@/lib/prisma";

// ─── Feature flag ──────────────────────────────────────────────────────────────
// Automatic ABA PayWay is paused. While this is false, ABA orders use the manual
// KHQR / bank-transfer + proof flow. Flip ABA_PAYWAY_ENABLED=true in env once the
// merchant credentials and callback are confirmed.
//
// SERVER-ONLY: this module imports prisma and reads ABA_API_KEY-adjacent env, so
// it must never be imported into a client component. The ABA API key is never
// sent to the browser.
export const ABA_PAYWAY_ENABLED = process.env.ABA_PAYWAY_ENABLED === "true";

// ─── Manual ABA account details (managed in the admin Settings page) ───────────
export type AbaManualSettings = {
  accountName: string | null;
  accountNumber: string | null;
  khqrImage: string | null;
  instructions: string | null;
};

export const ABA_SETTING_KEYS = {
  name: "aba_account_name",
  number: "aba_account_number",
  khqr: "aba_khqr_image",
  instructions: "aba_payment_instructions",
} as const;

export async function getAbaManualSettings(): Promise<AbaManualSettings> {
  let map: Record<string, string> = {};
  try {
    const rows = await prisma.settings.findMany({
      where: { key: { in: Object.values(ABA_SETTING_KEYS) } },
    });
    map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unreachable (e.g. during build/prerender) — return nulls so the page
    // still renders instead of crashing.
  }
  return {
    accountName: map[ABA_SETTING_KEYS.name]?.trim() || null,
    accountNumber: map[ABA_SETTING_KEYS.number]?.trim() || null,
    khqrImage: map[ABA_SETTING_KEYS.khqr]?.trim() || null,
    instructions: map[ABA_SETTING_KEYS.instructions]?.trim() || null,
  };
}
