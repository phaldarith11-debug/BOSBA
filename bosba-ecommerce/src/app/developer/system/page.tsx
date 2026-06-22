import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function DeveloperSystemPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Core identity and contact info. These values are read by the website and the mobile app from the database.
        </p>
      </div>
      <SettingsForm groupId="system" />
    </div>
  );
}
