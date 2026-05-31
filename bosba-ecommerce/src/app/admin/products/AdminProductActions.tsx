"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function AdminProductActions({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm("Archive this product? It will be hidden from the store.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product archived");
        router.refresh();
      } else {
        toast.error("Failed to archive product");
      }
    } catch {
      toast.error("Network error — could not archive product");
    } finally {
      setDeleting(false);
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
        disabled={deleting}
        title="Archive"
        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
