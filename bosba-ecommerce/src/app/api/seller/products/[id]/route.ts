import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? "4100");

/** Confirms the product exists AND belongs to the current seller. */
async function ownedOr404(id: string, sellerId: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.sellerId !== sellerId) return null;
  return product;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const product = await ownedOr404(params.id, seller.sellerId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await ownedOr404(params.id, seller.sellerId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (b.nameEn !== undefined) data.nameEn = String(b.nameEn).trim();
  if (b.nameKm !== undefined) data.nameKm = String(b.nameKm).trim();
  if (b.descriptionEn !== undefined) data.descriptionEn = (b.descriptionEn as string) || null;
  if (b.descriptionKm !== undefined) data.descriptionKm = (b.descriptionKm as string) || null;
  if (b.categoryId !== undefined) data.categoryId = String(b.categoryId);
  if (b.priceUsd !== undefined) {
    const priceUsd = Number(b.priceUsd);
    if (!(priceUsd > 0)) return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
    data.priceUsd = priceUsd;
    if (b.priceKhr === undefined) data.priceKhr = Math.round(priceUsd * KHR_RATE);
  }
  if (b.priceKhr !== undefined) data.priceKhr = Number(b.priceKhr);
  if (b.stock !== undefined) data.stock = Number(b.stock);
  if (b.active !== undefined) data.active = !!b.active;
  if (Array.isArray(b.images)) data.images = (b.images as string[]).slice(0, 10);

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await ownedOr404(params.id, seller.sellerId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft-delete: deactivate so order history that references it stays intact.
  await prisma.product.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
