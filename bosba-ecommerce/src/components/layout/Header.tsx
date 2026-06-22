"use client";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Heart, User, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useWishlistStore } from "@/store/wishlist";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SettingsSheet } from "./SettingsSheet";

/** A resolved nav link from the CMS "header" menu (label already localized). */
export type HeaderMenuLink = { label: string; href: string };

export function Header({ menu }: { menu?: HeaderMenuLink[] }) {
  const t = useTranslations("nav");
  const { brandName, brandLogo } = useSiteSettings();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.count());
  const { currency, setCurrency } = useCurrencyStore();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(totalItems);
  const [cartBump, setCartBump] = useState(false);
  // Cart/wishlist counts come from localStorage-persisted stores that are 0
  // during SSR, so badges are deferred until after mount to avoid hydration
  // mismatch.
  const [mounted, setMounted] = useState(false);
  // Fall back to the brand name if the CMS logo URL is broken/unreachable, so a
  // bad URL never shows the browser's broken-image icon.
  const [logoOk, setLogoOk] = useState(true);

  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > prevCount) {
      setCartBump(true);
      const tm = setTimeout(() => setCartBump(false), 500);
      return () => clearTimeout(tm);
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = (e.target as HTMLInputElement).value.trim();
      if (q) {
        router.push(`/products?search=${encodeURIComponent(q)}`);
        setSearchOpen(false);
      }
    }
    if (e.key === "Escape") setSearchOpen(false);
  }

  const navLinks = [
    { label: t("home"),                   href: "/" },
    { label: t("products"),               href: "/products" },
    { label: t("categories.electronics"), href: "/products?category=electronics" },
    { label: t("categories.fashion"),     href: "/products?category=fashion" },
    { label: t("categories.food"),        href: "/products?category=food" },
  ];

  // Use the CMS-managed "header" menu when published; otherwise fall back to the
  // built-in localized links so the nav is never empty.
  const desktopLinks: HeaderMenuLink[] = menu && menu.length > 0 ? menu : navLinks;

  return (
    <header
      className={`sticky top-0 z-50 header-safe transition-all duration-300 ${
        scrolled ? "glass shadow-sm" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main bar */}
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          {/* Logo — brand name/logo come from the dashboard CMS (falls back to "BOSBA") */}
          <Link href="/" className="flex-shrink-0 group" aria-label={brandName}>
            {brandLogo && logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogo}
                alt={brandName}
                width={128}
                height={32}
                onError={() => setLogoOk(false)}
                className="h-7 md:h-8 w-auto object-contain transition-opacity group-hover:opacity-85"
              />
            ) : (
              <span className="text-xl md:text-2xl font-black tracking-tight gradient-text transition-opacity group-hover:opacity-85">
                {brandName}
              </span>
            )}
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-brand-200 focus:ring-2 focus:ring-brand-100 transition-all placeholder:text-gray-400"
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {/* Mobile search toggle */}
            <button
              className="md:hidden tap-target flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Mobile: language + currency live in the settings bottom sheet */}
            <button
              className="md:hidden tap-target flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setSettingsOpen(true)}
              aria-label={t("settings")}
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {/* Desktop: language / currency inline */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => setCurrency(currency === "USD" ? "KHR" : "USD")}
              className="hidden md:flex items-center text-xs font-semibold border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {currency === "USD" ? "$ USD" : "៛ KHR"}
            </button>

            {/* Wishlist — desktop only (mobile reaches it via profile/tab bar) */}
            <Link
              href="/wishlist"
              className="relative hidden md:flex p-2.5 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label={t("wishlist")}
            >
              <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1 leading-none">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative tap-target flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors group"
              aria-label={t("cart")}
            >
              <ShoppingCart
                className={`h-5 w-5 text-gray-600 group-hover:text-brand-600 transition-colors ${
                  cartBump ? "animate-wiggle" : ""
                }`}
              />
              {mounted && totalItems > 0 && (
                <span
                  className={`absolute top-1 right-1 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 leading-none ${
                    cartBump ? "animate-cart-bump" : ""
                  }`}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {session ? (
              <div className="relative group">
                <button className="flex items-center p-1.5 rounded-full hover:bg-gray-100 transition-colors ml-0.5">
                  <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {session.user?.name?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                  </div>
                </button>

                {/* Dropdown (desktop hover) */}
                <div className="absolute right-0 top-full mt-2 w-54 bg-white rounded-2xl shadow-popup border border-gray-100/80 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50 min-w-[220px]">
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                  </div>
                  {[
                    { label: t("profile"), href: "/profile" },
                    { label: t("orders"),  href: "/orders" },
                    { label: t("wishlist"), href: "/wishlist" },
                  ].map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                  {(session.user as { role?: string }).role === "ADMIN" && (
                    <a
                      href="/admin"
                      className="flex items-center px-4 py-2.5 text-sm text-brand-600 font-medium hover:bg-brand-50 transition-colors"
                    >
                      {t("admin")}
                    </a>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold bg-red-600 text-white px-3.5 md:px-4 py-2 rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-btn ml-1"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-0.5 pb-2">
          {desktopLinks.map(({ label, href }) => {
            const cls =
              "text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all";
            return href.startsWith("/") ? (
              <Link key={href} href={href} className={cls}>
                {label}
              </Link>
            ) : (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-down">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="search"
                placeholder={t("mobileSearch")}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                onKeyDown={handleSearch}
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Language + currency bottom sheet (mobile) */}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
