import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Add New Product"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Add New" },
        ]}
      />
      <ProductForm categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))} />
    </div>
  );
}
