import Link from "next/link";
import {
  Sliders, FlaskConical, KeyRound, Plug, Palette, LayoutTemplate,
  Wrench, ScrollText, ArrowRight,
} from "lucide-react";

const CARDS = [
  { href: "/developer/system", icon: Sliders, label: "System Settings", desc: "Core platform configuration" },
  { href: "/developer/feature-flags", icon: FlaskConical, label: "Feature Flags", desc: "Toggle features on web + mobile" },
  { href: "/developer/api", icon: KeyRound, label: "API Settings", desc: "Keys, webhooks, integrations" },
  { href: "/developer/app-config", icon: Plug, label: "App Config", desc: "App-wide runtime configuration" },
  { href: "/developer/themes", icon: Palette, label: "Themes", desc: "Brand colors, fonts, tokens" },
  { href: "/developer/layout", icon: LayoutTemplate, label: "Layout", desc: "Sections, menus, navigation" },
  { href: "/developer/maintenance", icon: Wrench, label: "Maintenance", desc: "Maintenance mode and cache" },
  { href: "/developer/logs", icon: ScrollText, label: "Logs & Errors", desc: "Audit trail and error logs" },
];

export default function DeveloperDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developer Console</h1>
        <p className="text-sm text-gray-500 mt-1">
          System configuration, feature flags, theming, and platform tools. Deep features arrive in later milestones.
        </p>
      </div>

      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-800">
        The platform console is scaffolded. Logs already read from the live audit trail; the
        remaining tools become functional as the settings, theme, and layout systems land.
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
