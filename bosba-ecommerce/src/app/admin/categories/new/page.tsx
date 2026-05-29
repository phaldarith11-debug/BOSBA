import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true },
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/categories" className="hover:text-gray-900">Categories</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">New Category</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new product category</p>
      </div>

      <CategoryForm categories={categories} />
    </div>
  );
}
