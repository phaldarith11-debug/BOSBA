import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profile = await prisma.sellerProfile.upsert({
    where: { userId: seller.sellerId },
    update: {},
    create: { userId: seller.sellerId },
  });
  return NextResponse.json({
    profile: { ...profile, commissionPct: Number(profile.commissionPct) },
  });
}

export async function PUT(req: NextRequest) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  // Seller may edit store details + payout info, but NOT commission % or approval.
  const fields = ["storeName", "storeNameKm", "bio", "logo", "phone", "payoutMethod", "payoutAccount", "payoutName"] as const;
  const data: Record<string, unknown> = {};
  for (const f of fields) if (b[f] !== undefined) data[f] = b[f] === "" ? null : b[f];

  const profile = await prisma.sellerProfile.upsert({
    where: { userId: seller.sellerId },
    update: data,
    create: { userId: seller.sellerId, ...data },
  });
  return NextResponse.json({
    profile: { ...profile, commissionPct: Number(profile.commissionPct) },
  });
}
