import Link from "next/link";
import {
  Sliders, FlaskConical, KeyRound, Plug, Palette, LayoutTemplate,
  Wrench, ScrollText, Blocks, ListTree, ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/dev-settings";

export const dynamic = "force-dynamic";

const CARDS = [
  { href: "/developer/system", icon: Sliders, label: "Site Settings", desc: "Core platform configuration" },
  { href: "/developer/themes", icon: Palette, label: "Theme & Branding", desc: "Colors, fonts, logo, radius" },
  { href: "/developer/app-config", icon: Plug, label: "App Settings", desc: "Hero & announcement content" },
  { href: "/developer/homepage", icon: Blocks, label: "Homepage Builder", desc: "Sections for web + mobile" },
  { href: "/developer/menus", icon: ListTree, label: "Menu Builder", desc: "Header, footer, tab navigation" },
  { href: "/developer/feature-flags", icon: FlaskConical, label: "Feature Flags", desc: "Toggle features without deploy" },
  { href: "/developer/maintenance", icon: Wrench, label: "Maintenance", desc: "Take the storefront offline" },
  { href: "/developer/api", icon: KeyRound, label: "API Status", desc: "Integration configuration" },
  { href: "/developer/layout", icon: LayoutTemplate, label: "Layout", desc: "No-code layout tools" },
  { href: "/developer/logs", icon: ScrollText, label: "Logs & Errors", desc: "System + audit trail" },
];

async function getStatus() {
  try {
    const [flags, sections, map] = await Promise.all([
      prisma.featureFlag.count(),
      prisma.pageSection.count(),
      getSettingsMap(),
    ]);
    return { flags, sections, maintenance: map.maintenance_mode === "true" };
  } catch {
    return { flags: 0, sections: 0, maintenance: false };
  }
}

export default async function DeveloperDashboardPage() {
  const status = await getStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developer Console</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control the website and mobile UI from the database — settings, theming, layout, and feature flags. No source edits required.
        </p>
      </div>

      {/* Live status */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{status.sections}</p>
          <p className="text-xs text-gray-500">CMS sections</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{status.flags}</p>
          <p className="text-xs text-gray-500">Feature flags</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className={`text-sm font-bold mt-1 ${status.maintenance ? "text-amber-600" : "text-green-600"}`}>
            {status.maintenance ? "● Maintenance ON" : "● Live"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Storefront status</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
