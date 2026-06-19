import { Toaster } from "react-hot-toast";
import { DashboardSidebar, MobileDashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DEVELOPER_NAV_GROUPS } from "@/components/dashboard/navConfig";
import { requireArea } from "@/lib/authz-server";
import { Providers } from "../providers";
import "../globals.css";

const DEVELOPER_BRAND = {
  accent: "indigo" as const,
  brandLabel: "BOSBA Developer",
  brandSubtitle: "Platform Console",
  homeHref: "/developer",
  storageKey: "developer-sidebar-collapsed",
  footerNote: "BOSBA Platform Console",
};

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await requireArea("developer");

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
              <DashboardSidebar {...DEVELOPER_BRAND} groups={DEVELOPER_NAV_GROUPS} />
            </div>
            <MobileDashboardSidebar {...DEVELOPER_BRAND} groups={DEVELOPER_NAV_GROUPS} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <DashboardTopBar signOutCallbackUrl="/developer/login" fallbackName="Developer" />
              <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
