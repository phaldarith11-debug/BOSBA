import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function DeveloperThemesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Theme &amp; Branding</h1>
        <p className="text-sm text-gray-500 mt-1">
          Colors, fonts, logo, and corner radius. Applied live to the website via CSS variables and delivered to the
          mobile app through <code className="text-xs bg-gray-100 px-1 rounded">/api/app-settings</code>.
        </p>
      </div>
      <SettingsForm groupId="theme" />

      <div className="pt-2">
        <h2 className="text-lg font-bold text-gray-900">Installed App (PWA)</h2>
        <p className="text-sm text-gray-500 mt-1 mb-3">
          Controls the home-screen app icon, name, and splash/theme colors used when customers install the site.
          Blank fields inherit from Brand &amp; Theme above.
        </p>
        <SettingsForm groupId="pwa" />
      </div>
    </div>
  );
}
