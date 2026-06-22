import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function DeveloperMaintenancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Turn the storefront off for shoppers during updates. Admin, Seller, and Developer dashboards stay fully
          accessible so staff can keep working.
        </p>
      </div>
      <SettingsForm groupId="maintenance" />
    </div>
  );
}
