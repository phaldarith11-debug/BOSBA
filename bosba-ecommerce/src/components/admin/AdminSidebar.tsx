"use client";
import {
  DashboardSidebar,
  MobileDashboardSidebar,
  type NavGroup,
} from "@/components/dashboard/DashboardSidebar";
import { ADMIN_NAV_GROUPS } from "@/components/dashboard/navConfig";

interface AdminSidebarProps {
  pendingOrders?: number;
  forceExpand?: boolean;
}

const ADMIN_BRAND = {
  accent: "red" as const,
  brandLabel: "BOSBA Admin",
  brandSubtitle: "Management Console",
  homeHref: "/admin",
  storageKey: "admin-sidebar-collapsed",
  footerNote: "BOSBA v2.0 · All systems operational",
};

function adminGroups(pendingOrders: number): NavGroup[] {
  return ADMIN_NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.map((item) =>
      item.href === "/admin/orders" ? { ...item, badge: pendingOrders } : item
    ),
  }));
}

export function AdminSidebar({ pendingOrders = 0, forceExpand = false }: AdminSidebarProps) {
  return (
    <DashboardSidebar
      {...ADMIN_BRAND}
      groups={adminGroups(pendingOrders)}
      forceExpand={forceExpand}
    />
  );
}

export function MobileAdminSidebar({ pendingOrders = 0 }: AdminSidebarProps) {
  return <MobileDashboardSidebar {...ADMIN_BRAND} groups={adminGroups(pendingOrders)} />;
}
