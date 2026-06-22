import { getLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { getPublishedMenu, menuLabel } from "@/lib/menus";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  // CMS-managed navigation (published items only); empty → components fall back
  // to their built-in links, so the nav is never blank.
  const [headerItems, footerItems] = await Promise.all([
    getPublishedMenu("header", "web"),
    getPublishedMenu("footer", "web"),
  ]);
  const headerMenu = headerItems.map((i) => ({ label: menuLabel(i, locale), href: i.url }));
  const footerMenu = footerItems.map((i) => ({ label: menuLabel(i, locale), href: i.url }));

  // pb-tabbar keeps the footer clear of the fixed mobile tab bar (and the
  // iPhone home indicator); it collapses to 0 on desktop.
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-tabbar md:pb-0">
      <AnnouncementBar />
      <Header menu={headerMenu} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer quickLinks={footerMenu} />
      <MobileTabBar />
    </div>
  );
}
