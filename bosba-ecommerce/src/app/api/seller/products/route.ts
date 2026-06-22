import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller-server";

const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? "4100");

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";
}

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    where: { sellerId: seller.sellerId },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { nameEn: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const nameEn = String(b.nameEn ?? "").trim();
  const nameKm = String(b.nameKm ?? "").trim() || nameEn;
  const categoryId = String(b.categoryId ?? "");
  const priceUsd = Number(b.priceUsd ?? 0);

  if (!nameEn) return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "Category is required" }, { status: 400 });
  if (!(priceUsd > 0)) return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });

  // Guarantee a unique slug.
  let slug = slugify(nameEn);
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await prisma.product.create({
    data: {
      nameEn,
      nameKm,
      slug,
      descriptionEn: (b.descriptionEn as string) || null,
      descriptionKm: (b.descriptionKm as string) || null,
      priceUsd,
      priceKhr: b.priceKhr ? Number(b.priceKhr) : Math.round(priceUsd * KHR_RATE),
      stock: b.stock != null ? Number(b.stock) : 0,
      images: Array.isArray(b.images) ? (b.images as string[]).slice(0, 10) : [],
      categoryId,
      sellerId: seller.sellerId,
      active: b.active !== false,
      status: "PUBLISHED",
    },
  });
  return NextResponse.json({ product }, { status: 201 });
}
