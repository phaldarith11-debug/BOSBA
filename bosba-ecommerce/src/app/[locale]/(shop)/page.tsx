import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, Truck, Shield, Headphones, RotateCcw } from "lucide-react";
import type { ProductWithCategory } from "@/types";

async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({
    ...p,
    priceUsd:     Number(p.priceUsd),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  }));
}

async function getCategories() {
  return prisma.category.findMany({ where: { parentId: null }, take: 8 });
}

const TRUST_ITEMS = [
  { icon: Truck,       text: "Fast Delivery" },
  { icon: Shield,      text: "Secure Payment" },
  { icon: Headphones,  text: "24/7 Support" },
  { icon: RotateCcw,   text: "Easy Returns" },
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[480px] flex items-center">
        {/* Dot-grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 mb-5">
              🇰🇭 {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 text-white text-balance">
              {t("hero.title")}
              <br />
              <span className="text-yellow-300">{t("hero.highlight")}</span>
            </h1>
            <p className="text-red-100/90 mb-8 text-lg max-w-md leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-7 py-3.5 rounded-full hover:bg-yellow-50 active:scale-95 transition-all shadow-lg"
              >
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3.5 rounded-full border border-white/25 hover:bg-white/20 active:scale-95 transition-all"
              >
                {t("featured.viewAll")}
              </Link>
            </div>
          </div>

          {/* Decorative card */}
          <div className="hidden md:flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-white/5 rounded-3xl rotate-6 blur-sm" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl -rotate-3 border border-white/20 p-8 text-center shadow-glass">
                <span className="text-7xl block mb-3">🛍️</span>
                <p className="text-white font-black text-2xl leading-none">BOSBA</p>
                <p className="text-white/60 text-sm mt-1">Cambodia&apos;s Online Store</p>
                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                  {["ABA", "Wing", "COD"].map((p) => (
                    <span
                      key={p}
                      className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full border border-white/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-600">
                <Icon className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t("categories.title")}</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-card-hover transition-all animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.nameEn}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center text-xl group-hover:bg-red-100 transition-colors">
                    🏷️
                  </div>
                )}
                <span className="text-[11px] font-semibold text-gray-700 text-center line-clamp-1">
                  {cat.nameEn}
                </span>
                <span className="text-[10px] text-khmer text-gray-400 text-center line-clamp-1">
                  {cat.nameKm}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t("featured.title")}</h2>
            <Link
              href="/products?featured=true"
              className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:gap-2 transition-all"
            >
              {t("featured.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Promo banner ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden bg-dark-gradient rounded-3xl p-8 sm:p-12">
          {/* Glow accents */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-xl">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
              Nationwide Delivery
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
              {t("delivery.title")}
            </h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base leading-relaxed">
              {t("delivery.zones")}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-7 py-3.5 rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-btn"
            >
              {t("delivery.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
