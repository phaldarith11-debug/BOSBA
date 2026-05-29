"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, MapPin,
  BarChart3, Settings, ExternalLink, Image, Layers, Star,
  FileText, Search, Shield, Activity, ChevronDown, ChevronRight,
  Megaphone, UserCog, Menu, X, Bell,
} from "lucide-react";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", icon: Package, label: "Products" },
      { href: "/admin/categories", icon: Layers, label: "Categories" },
      { href: "/admin/media", icon: Image, label: "Media Library" },
      { href: "/admin/reviews", icon: Star, label: "Reviews" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { href: "/admin/coupons", icon: Tag, label: "Coupons" },
      { href: "/admin/zones", icon: MapPin, label: "Delivery Zones" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/banners", icon: Megaphone, label: "Banners" },
      { href: "/admin/content", icon: FileText, label: "Homepage Editor" },
      { href: "/admin/seo", icon: Search, label: "SEO Manager" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", icon: Users, label: "Customers" },
      { href: "/admin/staff", icon: UserCog, label: "Staff & Roles" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
      { href: "/admin/activity", icon: Activity, label: "Activity Log" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/notifications", icon: Bell, label: "Notifications" },
    ],
  },
];

function NavGroupSection({
  group,
  pathname,
  defaultOpen = true,
}: {
  group: NavGroup;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const hasActive = group.items.some(
    (item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
      >
        <span>{group.label}</span>
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {open && (
        <div className="space-y-0.5">
          {group.items.map(({ href, icon: Icon, label, badge }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0 ${
                      isActive ? "bg-white/30 text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AdminSidebarProps {
  pendingOrders?: number;
}

export function AdminSidebar({ pendingOrders = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  // Inject badge into Orders
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.map((item) =>
      item.href === "/admin/orders" ? { ...item, badge: pendingOrders } : item
    ),
  }));

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-3">
        <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">B</span>
        </div>
        <div className="min-w-0">
          <Link href="/admin" className="text-sm font-bold text-white hover:text-red-400 transition-colors truncate block">
            BOSBA Admin
          </Link>
          <p className="text-[10px] text-gray-500 truncate">Management Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
        {groups.map((group, i) => (
          <NavGroupSection
            key={group.label}
            group={group}
            pathname={pathname}
            defaultOpen={i < 4}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>View Store</span>
        </Link>
        <div className="px-3 py-1.5">
          <p className="text-[10px] text-gray-600">BOSBA v2.0 · All systems operational</p>
        </div>
      </div>
    </aside>
  );
}

/* ─── Mobile sidebar wrapper ──────────────────────────────────────── */
export function MobileAdminSidebar({ pendingOrders = 0 }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 md:hidden bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <AdminSidebar pendingOrders={pendingOrders} />
        </div>
      </div>
    </>
  );
}
