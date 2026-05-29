"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

export function AdminProductActions({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Archive this product? It will be hidden from the store.")) return;
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product archived");
      router.refresh();
    } else {
      toast.error("Failed to archive product");
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <a
        href={`/products/${slug}`}
        target="_blank"
        rel="noreferrer"
        title="View in store"
        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <Eye className="h-4 w-4" />
      </a>
      <Link
        href={`/admin/products/${productId}/edit`}
        title="Edit"
        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        title="Archive"
        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
