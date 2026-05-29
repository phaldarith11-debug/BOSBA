import { BannerForm } from "@/components/admin/BannerForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/banners" className="hover:text-gray-900">Banners</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">New Banner</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Banner</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new promotional banner to your store</p>
      </div>
      <BannerForm />
    </div>
  );
}
