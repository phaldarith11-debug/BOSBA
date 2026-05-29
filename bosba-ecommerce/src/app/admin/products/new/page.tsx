import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-5">
        <Link href="/admin/products" className="hover:text-red-600">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 font-medium">New Product</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Product</h1>
      <ProductForm categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))} />
    </div>
  );
}
