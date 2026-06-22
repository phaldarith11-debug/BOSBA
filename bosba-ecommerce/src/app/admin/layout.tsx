import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar, MobileAdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Toaster } from "react-hot-toast";
import { prisma } from "@/lib/prisma";
import { canAccessArea } from "@/lib/authz";
import { Providers } from "../providers";
import "../globals.css";

// Auth-gated + per-request session → always dynamic (never statically prerendered).
export const dynamic = "force-dynamic";

async function getPendingOrders() {
  try {
    return await prisma.order.count({ where: { status: "PENDING" } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Resilient: a thrown session error must not crash the whole route (it would
  // render the bare "Application error" page). Fall back to "no session" so the
  // public /admin/login still renders and the error boundary can catch the rest.
  let role: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    role = (session?.user as { role?: string } | undefined)?.role;
  } catch (err) {
    console.error("[admin/layout] getServerSession failed:", err);
  }
  // Anyone allowed in the admin area (OWNER/ADMIN/MANAGER/EDITOR/STAFF/VIEWER).
  const isStaff = canAccessArea(role, "admin");

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
