import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "../../ProductForm";

export default function EditSellerProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/seller/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ChevronLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm productId={params.id} />
    </div>
  );
}
