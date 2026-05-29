import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, CheckCircle, XCircle } from "lucide-react";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
  });

  const positions: Record<string, string> = {
    hero: "Hero Slider",
    promo: "Promo Bar",
    sidebar: "Sidebar",
    popup: "Popup",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">{banners.length} total</p>
        </div>
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center gap-4 text-gray-400">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-600">No banners yet</p>
            <p className="text-sm">Create your first banner to display on the homepage</p>
          </div>
          <Link
            href="/admin/banners/new"
            className="bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
          >
            Create Banner
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => {
            const now = new Date();
            const isLive =
              banner.active &&
              (!banner.startsAt || banner.startsAt <= now) &&
              (!banner.endsAt || banner.endsAt >= now);

            return (
              <div key={banner.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-stretch gap-0">
                  {/* Thumbnail */}
                  <div className="w-40 h-28 relative flex-shrink-0 bg-gray-100">
                    <Image
                      src={banner.image}
                      alt={banner.titleEn}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {positions[banner.position] ?? banner.position}
                        </span>
                        <span className="text-xs text-gray-400">Order: {banner.sortOrder}</span>
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{banner.titleEn}</h3>
                      {banner.subtitleEn && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{banner.subtitleEn}</p>
                      )}
                      {(banner.startsAt || banner.endsAt) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {banner.startsAt && `From ${new Date(banner.startsAt).toLocaleDateString()}`}
                          {banner.endsAt && ` · Until ${new Date(banner.endsAt).toLocaleDateString()}`}
                        </p>
                      )}
                      {banner.link && (
                        <p className="text-xs text-blue-500 mt-0.5 truncate">→ {banner.link}</p>
                      )}
                    </div>

                    <Link
                      href={`/admin/banners/${banner.id}/edit`}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex-shrink-0 ml-4"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
