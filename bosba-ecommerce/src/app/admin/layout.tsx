import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar, MobileAdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Toaster } from "react-hot-toast";
import { prisma } from "@/lib/prisma";
import { Providers } from "../providers";
import "../globals.css";

async function getPendingOrders() {
  try {
    return await prisma.order.count({ where: { status: "PENDING" } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "ADMIN" || role === "MANAGER" || role === "EDITOR";

  if (!isStaff) {
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

  const pendingOrders = await getPendingOrders();

  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop sidebar */}
            <div className="hidden md:flex">
              <AdminSidebar pendingOrders={pendingOrders} />
            </div>

            {/* Mobile sidebar (drawer) */}
            <MobileAdminSidebar pendingOrders={pendingOrders} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <AdminTopBar pendingOrders={pendingOrders} />
              <main className="flex-1 overflow-auto p-4 md:p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
