import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const featured = searchParams.get("featured");

  const where: any = { active: true };
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { nameEn: { contains: search, mode: "insensitive" } },
      { nameKm: { contains: search } },
    ];
  }
  if (minPrice || maxPrice) {
    where.priceUsd = {};
    if (minPrice) where.priceUsd.gte = parseFloat(minPrice);
    if (maxPrice) where.priceUsd.lte = parseFloat(maxPrice);
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      nameEn: data.nameEn,
      nameKm: data.nameKm,
      slug: data.slug,
      descriptionEn: data.descriptionEn,
      descriptionKm: data.descriptionKm,
      priceUsd: data.priceUsd,
      priceKhr: data.priceKhr,
      comparePrice: data.comparePrice,
      stock: data.stock,
      sku: data.sku,
      images: data.images,
      featured: data.featured ?? false,
      categoryId: data.categoryId,
      weight: data.weight,
    },
    include: { category: true },
  });
  return NextResponse.json(product, { status: 201 });
}
