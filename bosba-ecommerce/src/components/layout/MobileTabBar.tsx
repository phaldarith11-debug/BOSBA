"use client";
import { Home, LayoutGrid, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";

/**
 * Native-style bottom tab bar — only rendered on mobile (`md:hidden`).
 * Sticks to the bottom of the viewport, sits above page content, and pads
 * itself past the iPhone home indicator with `pb-safe`.
 */
export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tabs = [
    { href: "/", label: t("home"), icon: Home, match: (p: string) => p === "/" },
    {
      href: "/products",
      label: t("products"),
      icon: ShoppingBag,
      match: (p: string) => p === "/products" || p.startsWith("/products/"),
    },
    {
      href: "/categories",
      label: t("categoriesTab"),
      icon: LayoutGrid,
      match: (p: string) => p.startsWith("/categories"),
    },
    {
      href: "/cart",
      label: t("cart"),
      icon: ShoppingCart,
      match: (p: string) => p.startsWith("/cart"),
      badge: true,
    },
    {
      href: session ? "/profile" : "/login",
      label: t("account"),
      icon: User,
      match: (p: string) => p.startsWith("/profile") || p.startsWith("/account") || p.startsWith("/login"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/90 pb-safe backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center gap-0.5 pb-1.5 pt-2 transition-colors active:scale-95"
              >
                <span className="relative">
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      active ? "text-brand-600" : "text-gray-400"
                    }`}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  {tab.badge && mounted && totalItems > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] font-medium leading-none transition-colors ${
                    active ? "text-brand-600" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
