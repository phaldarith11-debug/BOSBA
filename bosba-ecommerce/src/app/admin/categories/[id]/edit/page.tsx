import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" }, select: { id: true, nameEn: true } }),
  ]);

  if (!category) notFound();

  const initialValues = {
    nameEn: category.nameEn,
    nameKm: category.nameKm,
    nameJa: "",
    nameZh: "",
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    parentId: category.parentId ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/categories" className="hover:text-gray-900">Categories</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{category.nameEn}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-sm text-gray-500 mt-1">Update category details</p>
      </div>

      <CategoryForm
        categories={allCategories}
        initialValues={initialValues}
        categoryId={category.id}
      />
    </div>
  );
}
