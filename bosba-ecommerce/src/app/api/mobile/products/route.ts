import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const search   = searchParams.get("search") ?? undefined;
  const featured = searchParams.get("featured") === "true";
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const skip     = (page - 1) * limit;
  const sort     = searchParams.get("sort") ?? "createdAt_desc";

  const where: Record<string, unknown> = { active: true };

  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { nameEn: { contains: search, mode: "insensitive" } },
      { nameKm: { contains: search, mode: "insensitive" } },
    ];
  }
  if (featured) {
    where.featured = true;
  }

  const [field, direction] = sort.split("_") as [string, "asc" | "desc"];
  const orderBy = field === "price"
    ? { priceUsd: direction }
    : field === "name"
    ? { nameEn: direction }
    : { createdAt: direction ?? "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameKm: true,
        descriptionEn: true,
        descriptionKm: true,
        priceUsd: true,
        priceKhr: true,
        comparePrice: true,
        images: true,
        stock: true,
        featured: true,
        category: { select: { id: true, nameEn: true, nameKm: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + products.length < total,
  });
}
