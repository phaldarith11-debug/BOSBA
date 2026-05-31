import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
      <AdminPageHeader
        title="Edit Product"
        description={product.nameEn}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.nameEn },
        ]}
      />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))}
        initialValues={initialValues}
        productId={product.id}
      />
    </div>
  );
}
