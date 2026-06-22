import { Toaster } from "react-hot-toast";
import { AreaSidebar, MobileAreaSidebar } from "@/components/dashboard/AreaSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { requireArea } from "@/lib/authz-server";
import { Providers } from "../providers";
import "../globals.css";

// Auth-gated + per-request session → always dynamic (never statically prerendered).
export const dynamic = "force-dynamic";

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
              <AreaSidebar area="seller" {...SELLER_BRAND} />
            </div>
            <MobileAreaSidebar area="seller" {...SELLER_BRAND} />

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
