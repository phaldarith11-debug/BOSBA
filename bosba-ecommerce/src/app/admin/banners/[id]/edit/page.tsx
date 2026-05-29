import { prisma } from "@/lib/prisma";
import { BannerForm } from "@/components/admin/BannerForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditBannerPage({ params }: { params: { id: string } }) {
  const banner = await prisma.banner.findUnique({ where: { id: params.id } });
  if (!banner) notFound();

  const initialValues = {
    titleEn: banner.titleEn,
    titleKm: banner.titleKm,
    titleJa: banner.titleJa,
    titleZh: banner.titleZh,
    subtitleEn: banner.subtitleEn ?? "",
    subtitleKm: banner.subtitleKm ?? "",
    subtitleJa: banner.subtitleJa ?? "",
    subtitleZh: banner.subtitleZh ?? "",
    image: banner.image,
    link: banner.link ?? "",
    buttonText: banner.buttonText ?? "",
    position: banner.position,
    sortOrder: String(banner.sortOrder),
    active: banner.active,
    startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : "",
    endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/banners" className="hover:text-gray-900">Banners</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{banner.titleEn}</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
        <p className="text-sm text-gray-500 mt-1">Modify banner content and settings</p>
      </div>
      <BannerForm initialValues={initialValues} bannerId={banner.id} />
    </div>
  );
}
