import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function DeveloperAppConfigPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Homepage hero text and announcement bar content. Consumed by both the website and the mobile app.
        </p>
      </div>
      <SettingsForm groupId="app" />
    </div>
  );
}
