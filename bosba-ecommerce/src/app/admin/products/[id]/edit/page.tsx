import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  if (!product) notFound();

  const initialValues = {
    nameEn: product.nameEn,
    nameKm: product.nameKm ?? "",
    slug: product.slug,
    descriptionEn: product.descriptionEn ?? "",
    descriptionKm: product.descriptionKm ?? "",
    priceUsd: String(Number(product.priceUsd)),
    priceKhr: product.priceKhr != null ? String(product.priceKhr) : "",
    comparePrice: product.comparePrice ? String(Number(product.comparePrice)) : "",
    stock: String(product.stock),
    sku: product.sku ?? "",
    featured: product.featured,
    active: product.active,
    categoryId: product.categoryId,
    images: product.images,
  };

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-5">
        <Link href="/admin/products" className="hover:text-red-600">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.nameEn}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))}
        initialValues={initialValues}
        productId={product.id}
      />
    </div>
  );
}
