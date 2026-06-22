"use client";
import { DashboardSidebar, MobileDashboardSidebar } from "./DashboardSidebar";
import { SELLER_NAV_GROUPS, DEVELOPER_NAV_GROUPS } from "./navConfig";
import type { Accent } from "./DashboardSidebar";

/**
 * Client wrapper that resolves the nav groups itself. The groups contain
 * lucide icon *components*, which cannot be passed across the server→client
 * boundary as props — so the server layout passes only the serializable brand
 * config + an `area` string, and this client component looks up the icons.
 */
const GROUPS = {
  seller: SELLER_NAV_GROUPS,
  developer: DEVELOPER_NAV_GROUPS,
};

export interface AreaSidebarProps {
  area: keyof typeof GROUPS;
  accent?: Accent;
  brandLabel: string;
  brandSubtitle?: string;
  brandInitial?: string;
  homeHref: string;
  storageKey: string;
  footerNote?: string;
}

export function AreaSidebar({ area, ...brand }: AreaSidebarProps) {
  return <DashboardSidebar groups={GROUPS[area]} {...brand} />;
}

export function MobileAreaSidebar({ area, ...brand }: AreaSidebarProps) {
  return <MobileDashboardSidebar groups={GROUPS[area]} {...brand} />;
}
