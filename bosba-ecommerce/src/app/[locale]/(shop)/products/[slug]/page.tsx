import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};
  const title = params.locale === "km" ? product.nameKm : product.nameEn;
  return { title, description: product.descriptionEn?.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: { params: { slug: string; locale: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, active: true },
    include: { category: true, variants: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
    include: { category: true },
    take: 4,
  });

  const serialized = {
    ...product,
    priceUsd: Number(product.priceUsd),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    variants: product.variants.map((v) => ({ ...v, priceUsd: v.priceUsd ? Number(v.priceUsd) : null })),
  };

  return <ProductDetailClient product={serialized} related={related.map((p) => ({ ...p, priceUsd: Number(p.priceUsd), comparePrice: p.comparePrice ? Number(p.comparePrice) : null }))} />;
}
