import { Toaster } from "react-hot-toast";
import { DashboardSidebar, MobileDashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { SELLER_NAV_GROUPS } from "@/components/dashboard/navConfig";
import { requireArea } from "@/lib/authz-server";
import { Providers } from "../providers";
import "../globals.css";

const SELLER_BRAND = {
  accent: "emerald" as const,
  brandLabel: "BOSBA Seller",
  brandSubtitle: "Vendor Center",
  homeHref: "/seller",
  storageKey: "seller-sidebar-collapsed",
  footerNote: "BOSBA Seller Center",
};

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireArea("seller");

  // Public pages within /seller (e.g. /seller/login) render without the chrome.
  if (!session) {
    return (
      <html lang="en">
        <body>
          <Providers>
            <Toaster position="top-right" />
            {children}
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <div className="min-h-screen bg-gray-50 flex">
            <div className="hidden md:flex">
              <DashboardSidebar {...SELLER_BRAND} groups={SELLER_NAV_GROUPS} />
            </div>
            <MobileDashboardSidebar {...SELLER_BRAND} groups={SELLER_NAV_GROUPS} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <DashboardTopBar
                signOutCallbackUrl="/seller/login"
                accountHref="/seller/profile"
                fallbackName="Seller"
              />
              <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
