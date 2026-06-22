import Link from "next/link";
import { Blocks, ListTree, Palette, ArrowRight } from "lucide-react";

const TOOLS = [
  { href: "/developer/homepage", icon: Blocks, label: "Homepage Builder", desc: "Arrange hero, banners, product carousels, and other sections. Draft → publish to web + mobile." },
  { href: "/developer/menus", icon: ListTree, label: "Menu Builder", desc: "Edit header, footer, and mobile tab navigation. Published items are read by both surfaces." },
  { href: "/developer/themes", icon: Palette, label: "Theme & Branding", desc: "Colors, fonts, logo, and corner radius applied across the site." },
];

export default function DeveloperLayoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Layout &amp; Navigation</h1>
        <p className="text-sm text-gray-500 mt-1">
          No-code, config-driven layout. Everything here is stored in the database and rendered identically on the
          website and mobile app — no source edits required.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Icon className="h-5 w-5 text-indigo-600" /></div>
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
