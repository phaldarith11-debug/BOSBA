import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, MapPin,
  BarChart3, Settings, Image, Layers, Star, FileText, Search,
  Activity, Megaphone, UserCog, Bell, Banknote, Store, Wallet,
  Boxes, UserCircle, FlaskConical, KeyRound, Palette, LayoutTemplate,
  Wrench, ScrollText, Sliders, Plug, Blocks, ListTree,
} from "lucide-react";
import type { NavGroup } from "./DashboardSidebar";

/* ─── Admin (owner + managers) — existing console, unchanged ─── */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", icon: LayoutDashboard, label: "Dashboard" }],
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
      { href: "/admin/payments", icon: Banknote, label: "Payment Review" },
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

/* ─── Seller (marketplace vendor) ─── */
export const SELLER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/seller", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/seller/products", icon: Package, label: "My Products" },
      { href: "/seller/stock", icon: Boxes, label: "Stock" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/seller/orders", icon: ShoppingCart, label: "My Orders" },
      { href: "/seller/sales", icon: BarChart3, label: "Sales" },
      { href: "/seller/payments", icon: Wallet, label: "Payments" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/seller/profile", icon: UserCircle, label: "Business Profile" },
    ],
  },
];

/* ─── Developer (system/platform) ─── */
export const DEVELOPER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/developer", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Configuration",
    items: [
      { href: "/developer/system", icon: Sliders, label: "System Settings" },
      { href: "/developer/feature-flags", icon: FlaskConical, label: "Feature Flags" },
      { href: "/developer/api", icon: KeyRound, label: "API Settings" },
      { href: "/developer/app-config", icon: Plug, label: "App Config" },
    ],
  },
  {
    label: "Appearance",
    items: [
      { href: "/developer/homepage", icon: Blocks, label: "Homepage Builder" },
      { href: "/developer/menus", icon: ListTree, label: "Menu Builder" },
      { href: "/developer/themes", icon: Palette, label: "Themes" },
      { href: "/developer/layout", icon: LayoutTemplate, label: "Layout" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/developer/maintenance", icon: Wrench, label: "Maintenance" },
      { href: "/developer/logs", icon: ScrollText, label: "Logs & Errors" },
    ],
  },
];

/** Re-exported so callers have a single icon source if needed. */
export { Store };
