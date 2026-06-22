import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

/** Payout history + current payout settings for the seller. */
export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sid = seller.sellerId;

  const [payouts, profile, pending] = await Promise.all([
    prisma.payout.findMany({ where: { sellerId: sid }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.sellerProfile.findUnique({ where: { userId: sid } }),
    prisma.payout.aggregate({ where: { sellerId: sid, status: "PENDING" }, _sum: { amountUsd: true } }),
  ]);

  const paid = payouts
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + Number(p.amountUsd), 0);

  return NextResponse.json({
    payouts: payouts.map((p) => ({ ...p, amountUsd: Number(p.amountUsd) })),
    pendingUsd: Number(pending._sum.amountUsd ?? 0),
    paidUsd: Number(paid.toFixed(2)),
    commissionPct: profile ? Number(profile.commissionPct) : 10,
    payoutMethod: profile?.payoutMethod ?? null,
    payoutAccount: profile?.payoutAccount ?? null,
    payoutName: profile?.payoutName ?? null,
  });
}
